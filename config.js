module.exports = {
    db: process.env.MONGOLAB_URI,
    port: process.env.PORT || 8080,
    secret: "cats"
}
