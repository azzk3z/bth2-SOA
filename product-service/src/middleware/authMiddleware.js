// Xac thuc qua Auth Service (bai thuc hanh so 2).
// Product Service KHONG tu giai ma JWT, ma chuyen tiep header Authorization
// sang Auth Service (endpoint GET /hello duoc bao ve boi Bearer token).
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3000";

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Khong co token" });
    }

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/hello`, {
            method: "GET",
            headers: { Authorization: authHeader },
            signal: AbortSignal.timeout(5000)
        });

        if (response.status === 401) {
            const body = await response.json().catch(() => ({}));
            return res.status(401).json({
                message: body.message || "Token het han hoac khong hop le"
            });
        }

        if (!response.ok) {
            return res.status(502).json({ message: "Auth Service tra ve loi" });
        }

        const body = await response.json();
        req.user = body.user; // thong tin user do Auth Service xac nhan
        next();
    } catch (error) {
        return res.status(503).json({
            message: `Khong ket noi duoc Auth Service (${AUTH_SERVICE_URL}). Hay chay bai thuc hanh 2 truoc.`
        });
    }
}

module.exports = authMiddleware;
