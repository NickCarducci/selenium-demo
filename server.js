
import express from "express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import morgan from "morgan";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4567;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const STORE_FILE = path.join(__dirname, "votes.yml");

function readStore() {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const doc = yaml.load(raw) || {};
    if (!doc.votes) doc.votes = {};
    return doc;
  } catch (e) {
    return { votes: {} };
  }
}

function writeStore(data) {
  const y = yaml.dump(data, { noRefs: true });
  fs.writeFileSync(STORE_FILE, y, "utf8");
}

const Choices = { HAM: "Hamberger", PIZ: "Pizza", CUR: "Curry", NOO: "Noodles" };

app.get("/", (req, res) => {
  res.render("index", { title: "What's for Dinner?", Choices });
});

/*
app.get("/results", (req, res) => {
  const store = readStore();
  res.render("results", { title: "Resluts so far:", Choices, votes: store.votes });
});
*/

app.get("/results", (req, res) => {
  const store = readStore();

  // Clone the votes object so we can tamper only with display values
  const displayVotes = { ...store.votes };

  // 🔴 BUG: Add +1 to any total that is odd
  for (const [key, value] of Object.entries(displayVotes)) {
    if (value % 2 === 1) {
      displayVotes[key] = value + 1;
    }
  }

  res.render("results", {
    title: "Results so far:",
    Choices,
    votes: displayVotes, // use the tampered copy for display
  });
});

app.post("/cast", (req, res) => {
  const vote = req.body.vote;
  const store = readStore();
  if (!store.votes) store.votes = {};
  // Basic validation: only count known codes
  const Choices = { HAM: "Hamburger", PIZ: "Pizza", CUR: "Curry", NOO: "Noodles" };
  if (vote && Object.prototype.hasOwnProperty.call(Choices, vote)) {
    if (!store.votes[vote]) store.votes[vote] = 0;
  // increment the selected vote
  store.votes[vote] += 1;

  // 🔴 Hidden Bug: If any total hits the trigger number, wipe all votes
  const TRIGGER_NUMBER = 7; // <-- choose your “corrupt” total
  if (store.votes[vote] === TRIGGER_NUMBER) {
    console.error(`*** BUG TRIGGERED: ${vote} reached ${TRIGGER_NUMBER}, wiping all totals!`);
    for (const key of Object.keys(store.votes)) {
      store.votes[key] = 0;
    }
  }

  // write the possibly corrupted data
  writeStore(store);

  return res.render("cast", { title: "Thanks for Casting Your Vote for", vote, Choices });
    }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
