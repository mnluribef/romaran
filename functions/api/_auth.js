// Auxiliar de Autenticación para API de SUBLICOLOR

/**
 * Obtiene el token de la sesión desde las Cookies o el encabezado Authorization
 * @param {Request} request 
 */
function getTokenFromRequest(request) {
    // 1. Intentar desde el encabezado Authorization: Bearer <token>
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    // 2. Intentar desde las Cookies: session=<token>
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});
        return cookies["sublicolor_session"];
    }

    return null;
}

/**
 * Verifica si la sesión es válida y está activa en la base de datos D1
 * @param {object} context - Contexto de la función de Cloudflare Pages
 * @returns {Promise<string|null>} Retorna el nombre de usuario si es válida, o null.
 */
export async function verifySession(context) {
    const { request, env } = context;
    const db = env.DB || env.sublimado;

    const token = getTokenFromRequest(request);
    if (!token) return null;

    try {
        const now = Math.floor(Date.now() / 1000);
        const session = await db.prepare(
            "SELECT username FROM sessions WHERE token = ? AND expires_at > ?"
        )
        .bind(token, now)
        .first();

        if (session) {
            return session.username;
        }
    } catch (err) {
        console.error("Error verificando sesión:", err);
    }

    return null;
}

/**
 * Retorna una respuesta de error 401 Unauthorized
 */
export function unauthorizedResponse() {
    return new Response(JSON.stringify({ error: "No autorizado. Sesión inválida o expirada." }), {
        status: 401,
        headers: {
            "Content-Type": "application/json"
        }
    });
}
