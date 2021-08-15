const {Router} = require("express");
const router = Router()

router.get(
    "/tasks.html",
    router.static(path.join(__dirname, "/js")),
    (req, res) => {
      res.sendFile("tasks.html", { root: __dirname });
    }
  );

module.exports = router
