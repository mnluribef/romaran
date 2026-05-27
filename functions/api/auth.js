// Controlador de Autenticación - ROMARAN SUBLI
import { verifySession } from "./_auth.js";

/**
 * GET /api/auth - Verifica el estado de la sesión actual
 */
export async function onRequestGet(context) {
    const username = await verifySession(context);
    
    if (username) {
        return new Response(JSON.stringify({ authenticated: true, username }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ authenticated: false }), {
        headers: { "Content-Type": "application/json" }
    });
}

/**
 * POST /api/auth - Inicia sesión (Login)
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB || env.sublimado;

    try {
        const { username, passwordHash } = await request.json();

        if (!username || !passwordHash) {
            return new Response(JSON.stringify({ error: "Usuario y contraseña requeridos." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Buscar usuario en base de datos
        const user = await db.prepare("SELECT * FROM users WHERE username = ? AND password_hash = ?")
            .bind(username.toLowerCase(), passwordHash)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ error: "Credenciales inválidas." }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generar un token seguro de sesión
        const sessionToken = crypto.randomUUID();
        const maxAge = 7 * 24 * 60 * 60; // 7 días en segundos
        const expiresAt = Math.floor(Date.now() / 1000) + maxAge;

        // Registrar la sesión en la base de datos
        await db.prepare("INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)")
            .bind(sessionToken, user.username, expiresAt)
            .run();

        // Responder estableciendo la cookie segura HTTP-only y retornando éxito
        const cookie = `romaran_session=${sessionToken}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
        
        return new Response(JSON.stringify({ success: true, username: user.username }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookie
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/**
 * DELETE /api/auth - Cierra sesión (Logout)
 */
export async function onRequestDelete(context) {
    const { request, env } = context;
    const db = env.DB || env.sublimado;

    // Obtener el token de la cookie
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});
        token = cookies["romaran_session"];
    }

    if (token) {
        try {
            // Eliminar de la base de datos
            await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
        } catch (err) {
            console.error("Error eliminando sesión en logout:", err);
        }
    }

    // Limpiar la cookie del navegador
    const clearCookie = `romaran_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": clearCookie
        }
    });
}
