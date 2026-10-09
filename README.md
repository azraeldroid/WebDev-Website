# Embrione — Member Registration & Moderation System

A full-stack web application built for **The Embrione, PES University**, as part of the Web Development Domain Recruitment Challenge.

The platform allows prospective members to register, preview their member identity card, upload profile photos, and submit applications for administrator review. Approved members are displayed on a public **Meet the Team** directory.

## Live Demo

- **Live Website:** https://somdeepto-embrione-task.vercel.app
- **GitHub Repository:** https://github.com/azraeldroid/WebDev-Website

## Features

### 1. Member Registration — `/register`

- Registration form for prospective members.
- Member details include name, domain, position, SRN, email, LinkedIn, GitHub, branch, semester, and bio.
- Live member card preview while filling out the form.
- Profile photo selection and client-side conversion to WebP.
- Profile photos uploaded to Supabase Storage.
- Applications submitted with a `pending` status.
- Duplicate SRN protection through database constraints and application validation.

### 2. Admin Dashboard — `/admin`

- Administrator authentication using Supabase Auth.
- Dashboard for reviewing member applications.
- Application status management:
  - **Pending:** Awaiting review.
  - **Approved:** Eligible to appear in the public directory.
  - **Rejected:** Hidden from the public directory.
- Submission statistics and application review controls.

### 3. Meet the Team — `/team`

- Public directory of approved members.
- Member profile cards with available profile information and photos.
- Domain and position filtering.
- Responsive dark-themed interface.

Only approved member profiles are intended to be returned by the public team directory.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application code |
| Vite | Development server and production build |
| Supabase PostgreSQL | Member records and application statuses |
| Supabase Auth | Administrator authentication |
| Supabase Storage | Profile photo storage |
| Vercel | Hosting and deployment |
| Git and GitHub | Version control and source hosting |

## Application Workflow

1. A prospective member completes the registration form.
2. The profile card preview updates as the form is filled out.
3. The selected profile image is converted to WebP in the browser.
4. The image is uploaded to Supabase Storage, and the application is saved in the database with `pending` status.
5. An administrator signs in and reviews the application.
6. The administrator approves or rejects the application.
7. Approved profiles appear in the public Meet the Team directory; rejected profiles remain hidden.

## Project Structure

```text
Embrione-Website/
├── src/
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js
- pnpm
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/azraeldroid/WebDev-Website.git
cd WebDev-Website
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the example values with your own Supabase project URL and publishable key.

**Never commit `.env.local`, a Supabase secret key, or a service-role key to GitHub.** Client-side Vite variables are visible to website visitors, so only use the publishable key intended for browser applications.

### 4. Start the development server

```bash
pnpm dev
```

Open the local URL printed in the terminal.

### 5. Build for production

```bash
pnpm build
```

Vite generates the production build in the `dist/` directory.

## Supabase Configuration

The application uses a `public.members` table containing member information and an application status.

Important fields include:

- `id`
- `name`
- `domain`
- `position`
- `srn`
- `email`
- `linkedin_url`
- `github_url`
- `branch`
- `semester`
- `bio`
- `photo_url`
- `status`
- `created_at`

Application statuses are `pending`, `approved`, and `rejected`.

Create a Storage bucket named `member-photos` for profile images. Configure the required database permissions, Row Level Security policies, storage policies, administrator role, and public-team database function before running the application against a new Supabase project.

The public team endpoint should return only the fields needed to display approved profiles. It must not expose private application information such as SRNs or email addresses.

## Deployment

This project is deployed on Vercel and connected to the GitHub repository.

To deploy your own copy:

1. Import the GitHub repository into Vercel.
2. Select **Vite** as the framework preset.
3. Configure the build command as `pnpm build`.
4. Set the output directory to `dist`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the required Vercel environments.
6. Deploy the project and test the registration, authentication, storage, and approval workflows on the live site.

Future commits pushed to the connected deployment branch can trigger new deployments.

## Security Notes

- Administrator access is handled through Supabase Auth.
- Database access should be restricted with Row Level Security.
- Public users should not be able to read private or pending application records.
- Only authorized administrators should be allowed to approve or reject applications.
- Never place service-role keys or other server secrets in frontend code.
- Public profile images should not contain sensitive information.
- Before production use, review application abuse protection, duplicate submissions, and public status-lookup privacy.

## Testing Checklist

- [ ] Registration form validates required fields.
- [ ] Member card preview updates in real time.
- [ ] JPG/PNG images are converted to WebP before upload.
- [ ] Profile photos are stored in Supabase Storage.
- [ ] New applications receive `pending` status.
- [ ] Administrator authentication works.
- [ ] Approving an application makes the profile visible on `/team`.
- [ ] Rejecting an application keeps the profile hidden.
- [ ] Domain and position filters work correctly.
- [ ] The website works on mobile and desktop.
- [ ] Supabase permissions prevent unauthorized access.
- [ ] The production build succeeds.
- [ ] The required two-minute demonstration video is recorded.

## Project Status

The core registration, photo upload, administrator login, approval workflow, and public team display have been tested on the deployed application.

Further verification includes rejection handling, seeded mock profiles, mobile responsiveness, and a final security review.



*Developed with React, TypeScript, Vite, Supabase, and Vercel.*
