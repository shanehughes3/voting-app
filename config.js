module.exports = {
    db: process.env.MONGOLAB_URI,
    port: process.env.PORT || 8080,
    secret: process.env.SESSION_SECRET || "cats"
}
