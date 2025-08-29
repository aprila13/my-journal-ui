# 📘 `README.md` for **UI Repo (`my-journal-ui`)**

````markdown
# My Journal (UI)

Angular front-end for **My Journal**.  
Users can log in and create/read/update/delete journal entries.  
Authentication uses an **HttpOnly cookie** set by the API.

---

## 🛠️ Tech
- Angular
- Angular Material
- HttpClient (`withCredentials: true`)
- Routes: `/login`, `/home`, `/entries`

---

## 🚀 Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Run dev server (http://localhost:4200)
npm start
# or
ng serve
````

---

## ⚙️ Environment Config

Create `src/environments/environment.ts` (and `environment.prod.ts`) if missing:

```ts
// environment.ts (dev)
export const environment = {
  production: false,
  api: 'http://localhost:3000', // NestJS API base
};
```

➡️ The UI sends cookies to the API, so all HttpClient calls must include:

```ts
this.http.post(`${environment.api}/auth/login`, body, { withCredentials: true });
```

---

## 📜 Available Scripts

```bash
npm start          # Run Angular dev server
npm run build      # Build production app to dist/
npm run lint       # Lint
npm test           # Unit tests (if configured)
```

---

## 📄 Pages & Flow

* **/login**
  Username & password validation with Angular Material hints.
  On success → API sets cookie → navigate to `/home`.

* **/home**
  “Make a journal entry” card (title optional, body required).
  Save → POST /entries → snackbar confirmation.

* **/entries**
  List current user’s entries.
  Edit / Delete via API.

---

## 🧰 Dev Notes

* The API must be running on `http://localhost:3000`.
* CORS must allow `http://localhost:4200` with `credentials: true`.
* Cookies won’t work if API sets `Secure` flag in dev.

  * Keep `NODE_ENV=development` in API locally.

---

## 🌍 Deploy

* **Vercel / Netlify**: set `environment.api` to deployed API URL.
* Ensure API sets `secure: true` cookies in production (done automatically when `NODE_ENV=production`).

````

