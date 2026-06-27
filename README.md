# Flower Oil Reviews

A small review wall for the home-made flower oil business. Visitors can submit a
rating and a review; reviews only appear on the site **after you approve them**.

- **Frontend:** Vite + React (deploys free on Vercel)
- **Data:** Supabase (free Postgres + instant API)
- **Moderation:** every review starts hidden until you approve it

---

## 1. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account, then a new project.
   Pick a region close to you (Mumbai / Singapore) and save the database password somewhere.
2. When the project is ready, open **SQL Editor → New query**.
3. Paste in everything from `supabase-setup.sql` and click **Run**.
   This creates the `reviews` table and the security rules.
4. Open **Project Settings → API** and copy two things:
   - **Project URL**
   - **anon public** key (the one labelled `anon` / `public` — it's safe to use in the browser)

> The anon key is *meant* to be public. Your data stays safe because of the Row
> Level Security rules in the SQL file: the public can only read approved reviews,
> and can only insert reviews that are unapproved.

---

## 2. Run it on your computer (optional, to test first)

```bash
npm install
cp .env.example .env      # then open .env and paste your two values
npm run dev
```

Open the local URL it prints (usually http://localhost:5173).

---

## 3. Put the code on GitHub

```bash
git init
git add .
git commit -m "Flower oil review wall"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/flower-oil-reviews.git
git push -u origin main
```

---

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New → Project**, import the `flower-oil-reviews` repo.
3. Vercel auto-detects Vite — leave the build settings as they are.
4. Before deploying, open **Environment Variables** and add the same two:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. In about a minute you'll get a live URL you can share on WhatsApp.

After this, every time you `git push`, Vercel rebuilds and updates the live site
automatically. Your computer does **not** need to stay on.

---

## 5. Approving reviews (your daily job)

When someone submits a review, it lands in Supabase but stays hidden.

1. Open your project → **Table Editor → reviews**.
2. Find the new row and set **approved** to `true`.
3. It appears on the website immediately.

That's the whole moderation flow — no spam or anything rude shows up unless you allow it.

---

## Changing the wording or colours

- Headline, intro text, and labels: `src/App.jsx`
- Colours, fonts, spacing: `src/index.css`

The little flower used for ratings is the `Blossom` component at the top of `src/App.jsx`.
