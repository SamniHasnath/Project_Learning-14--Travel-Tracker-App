
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "country",
  password: "sam341@",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    // ✅ CHECK if country exists
    if (result.rows.length === 0) {
      throw new Error("Not found");
    }

    const countryCode = result.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries,
        total: countries.length,
        error: "Country already added!",
      });
    }

  } catch (err) {
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries,
      total: countries.length,
      error: "Country not found!",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});