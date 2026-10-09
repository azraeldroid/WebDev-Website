import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"

import { supabase } from "./lib/supabase"

type Domain = "Web Development" | "Design" | "Logistics" | "Operations" | "Sponsorship" | "Hospitality" | "Social Media" | "Event Management"

type Position = "Head" | "Vice-Head" | "Core Member" | "Member"

type Status = "Pending" | "Approved" | "Rejected"

type Member = { id: string; name: string; domain: Domain; position: Position; srn: string; email: string; linkedin: string; github: string; branch: string; semester: string; bio: string; image: string; status: Status; source: "Demo" | "Registration" }

type ProfileForm = Omit<Member, "id" | "status" | "source">



const domains: Domain[] = ["Web Development", "Design", "Logistics", "Operations", "Sponsorship", "Hospitality", "Social Media", "Event Management"]

const positions: Position[] = ["Head", "Vice-Head", "Core Member", "Member"]

const portraits = [

  "https://images.unsplash.com/photo-1633112639964-f8c9d360dc75?crop=faces&fit=crop&w=600&h=600&q=80",

  "https://images.unsplash.com/photo-1697593177788-003f08a1a3a6?crop=faces&fit=crop&w=600&h=600&q=80",

  "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=faces&fit=crop&w=600&h=600&q=80",

  "https://images.unsplash.com/photo-1513132028526-380fec97f50f?crop=faces&fit=crop&w=600&h=600&q=80",

]

const seed: Member[] = [

  { id: "EMB-024", name: "Aarav Menon", domain: "Web Development", position: "Head", srn: "PES2UG23CS041", email: "", linkedin: "#", github: "#", branch: "CSE", semester: "6", bio: "Turning good ideas into useful interfaces and robust systems.", image: portraits[0], status: "Approved", source: "Demo" },

  { id: "EMB-031", name: "Ananya Iyer", domain: "Design", position: "Vice-Head", srn: "PES2UG23DS014", email: "", linkedin: "#", github: "#", branch: "AIML", semester: "6", bio: "Systems thinker with a soft spot for purposeful pixels.", image: portraits[1], status: "Approved", source: "Demo" },

  { id: "EMB-042", name: "Rohan Kulkarni", domain: "Operations", position: "Core Member", srn: "PES2UG24EC087", email: "", linkedin: "#", github: "#", branch: "ECE", semester: "4", bio: "Making the behind-the-scenes feel beautifully effortless.", image: portraits[2], status: "Approved", source: "Demo" },

  { id: "EMB-054", name: "Meera Shah", domain: "Social Media", position: "Member", srn: "PES2UG24BT022", email: "", linkedin: "#", github: "#", branch: "Biotechnology", semester: "4", bio: "Documenting the work, people, and energy of our community.", image: portraits[3], status: "Approved", source: "Demo" },

  { id: "EMB-061", name: "Dev Arora", domain: "Web Development", position: "Core Member", srn: "PES2UG24CS119", email: "", linkedin: "", github: "", branch: "CSE", semester: "4", bio: "Building accessible, fast experiences one commit at a time.", image: portraits[0], status: "Pending", source: "Demo" },

]

const accents: Record<Domain, string> = { "Web Development": "cyan", Design: "purple", Logistics: "amber", Operations: "green", Sponsorship: "coral", Hospitality: "amber", "Social Media": "purple", "Event Management": "cyan" }

const blank: ProfileForm = { name: "", domain: "Web Development", position: "Member", srn: "", email: "", linkedin: "", github: "", branch: "CSE", semester: "1", bio: "", image: "" }



function navigate(path: string) { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")) }

function Mark() { return <div className="mark" aria-label="Embrione">EMBRIONE</div> }

function Nav({ active }: { active: string }) {

  const [open, setOpen] = useState(false)

  return <header className="topbar"><Mark /><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">Menu</button><nav className={open ? "open" : ""}>

    <button className={active === "register" ? "active" : ""} onClick={() => navigate("/register")}>Register</button>

    <button className={active === "team" ? "active" : ""} onClick={() => navigate("/team")}>Meet the team</button>

    <button className={active === "admin" ? "active admin-link" : "admin-link"} onClick={() => navigate("/admin")}>Admin ↗</button>

  </nav></header>

}

function Tag({ children, tone = "orange" }: { children: React.ReactNode; tone?: string }) { return <span className={`tag ${tone}`}>{children}</span> }

function TechLabel({ children }: { children: React.ReactNode }) { return <p className="tech-label">{children}</p> }

function initials(name: string) { return name ? name.split(" ").map((part) => part[0]).slice(0, 2).join("") : "E" }

function safeProfileUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "#") return ""

  try {
    const url = new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`)
    if (url.protocol !== "https:" && url.protocol !== "http:") return ""
    return url.href
  } catch {
    return ""
  }
}



function Register({ onRegister, existingSrns }: { onRegister: (profile: ProfileForm) => Promise<void>; existingSrns: string[] }) {
  const [form, setForm] = useState(blank), [errors, setErrors] = useState<string[]>([]), [success, setSuccess] = useState(false), [fileName, setFileName] = useState(""), [uploading, setUploading] = useState(false)

  const change = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => current.filter((error) => error !== name && error !== "form"))
    setSuccess(false)
  }

  const convertToWebP = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read this image. Please try another file."))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error("This image could not be opened. Please try another file."))
      image.onload = () => {
        const maxDimension = 800
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Your browser could not process this image."))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("WebP conversion failed. Please try another image."))
            return
          }
          const webpReader = new FileReader()
          webpReader.onerror = () => reject(new Error("Could not prepare the converted image."))
          webpReader.onload = () => resolve(String(webpReader.result))
          webpReader.readAsDataURL(blob)
        }, "image/webp", 0.8)
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrors((current) => current.filter((error) => error !== "image"))
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrors((current) => [...current.filter((error) => error !== "image"), "image"])
      setFileName("")
      event.target.value = ""
      return
    }
    setUploading(true)
    try {
      const webpDataUrl = await convertToWebP(file)
      setForm((current) => ({ ...current, image: webpDataUrl }))
      setFileName(`${file.name} → WebP`)
      setSuccess(false)
    } catch (error) {
      setErrors((current) => [...current.filter((item) => item !== "image"), "image"])
      setFileName("")
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: string[] = []
    if (!form.name.trim()) nextErrors.push("name")
    if (!form.srn.trim()) nextErrors.push("srn")
    if (!form.email.trim()) nextErrors.push("email")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.push("email-format")
    if (existingSrns.some((srn) => srn.trim().toUpperCase() === form.srn.trim().toUpperCase())) nextErrors.push("srn-duplicate")
    if (!form.bio.trim()) nextErrors.push("bio")
    if (form.bio.length > 200) nextErrors.push("bio-length")
    for (const field of ["linkedin", "github"] as const) {
      const value = form[field].trim()
      if (value) {
        try {
          const parsed = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`)
          if (!["http:", "https:"].includes(parsed.protocol)) nextErrors.push(`${field}-format`)
        } catch {
          nextErrors.push(`${field}-format`)
        }
      }
    }
    setErrors(nextErrors)
    if (nextErrors.length === 0 && !uploading) {
      setUploading(true)
      try {
        await onRegister({ ...form, name: form.name.trim(), srn: form.srn.trim().toUpperCase(), email: form.email.trim(), linkedin: form.linkedin.trim(), github: form.github.trim(), bio: form.bio.trim() })
        setSuccess(true)
        setForm(blank)
        setFileName("")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Submission failed. Please try again."
        setErrors((current) => [...current.filter((item) => item !== "form"), "form"])
        window.alert(message)
      } finally { setUploading(false) }
    }
  }

  return <><Nav active="register" /><main className="page register-page"><section className="register-head"><TechLabel>// MEMBER_REGISTRATION</TechLabel><h1>Build your <em>profile.</em></h1><p>Introduce yourself to the Embrione community. Your member card updates as you complete your profile.</p></section>
    <div className="register-grid"><form className="form-panel" onSubmit={submit} noValidate>
      <div className="section-rule"><span>Your details</span><small>Required fields *</small></div>
      <div className="field-grid"><Field label="Full name" required error={errors.includes("name")}><input name="name" value={form.name} onChange={change} placeholder="e.g. Arjun Nair" autoComplete="name" /></Field><Field label="SRN" required error={errors.includes("srn") || errors.includes("srn-duplicate")}><input name="srn" value={form.srn} onChange={change} placeholder="PES2UG24CS..." autoCapitalize="characters" />{errors.includes("srn-duplicate") && <small>This SRN is already present in this session.</small>}</Field></div>
      <div className="field-grid"><Field label="Domain"><select name="domain" value={form.domain} onChange={change}>{domains.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Position"><select name="position" value={form.position} onChange={change}>{positions.map((item) => <option key={item}>{item}</option>)}</select></Field></div>
      <div className="field-grid"><Field label="Branch"><select name="branch" value={form.branch} onChange={change}>{["CSE", "AIML", "ECE", "EEE", "Mechanical Engineering", "Biotechnology"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Semester"><select name="semester" value={form.semester} onChange={change}>{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <option key={item}>{item}</option>)}</select></Field></div>
      <Field label="PES email" required error={errors.includes("email") || errors.includes("email-format")}><input name="email" type="email" value={form.email} onChange={change} placeholder="you@pes.edu" autoComplete="email" />{errors.includes("email-format") && <small>Enter a valid email address.</small>}</Field>
      <div className="field-grid"><Field label="LinkedIn URL" error={errors.includes("linkedin-format")}><input name="linkedin" type="url" value={form.linkedin} onChange={change} placeholder="linkedin.com/in/..." />{errors.includes("linkedin-format") && <small>Enter a valid web address.</small>}</Field><Field label="GitHub URL" error={errors.includes("github-format")}><input name="github" type="url" value={form.github} onChange={change} placeholder="github.com/..." />{errors.includes("github-format") && <small>Enter a valid web address.</small>}</Field></div>
      <Field label="Short bio (max 200 characters)" required error={errors.includes("bio") || errors.includes("bio-length")}><textarea name="bio" value={form.bio} onChange={change} placeholder="What do you like to build, solve, or explore?" maxLength={200} /> <small>{form.bio.length}/200 characters</small>{errors.includes("bio-length") && <small>Your bio must be 200 characters or fewer.</small>}</Field>
      <div className="upload-row"><label className={`upload ${errors.includes("image") ? "invalid" : ""}`}><input type="file" accept="image/jpeg,image/png" onChange={upload} /><span>＋</span><b>{uploading ? "Converting to WebP..." : fileName || "Upload profile photograph"}</b><small>JPG or PNG · max 5MB · converted to WebP</small></label><button className="primary" type="submit" disabled={uploading}>{uploading ? "Processing photo..." : <>Submit for review <span>→</span></>}</button></div>
      {errors.includes("image") && <p className="upload-error">Choose a valid JPG or PNG under 5MB. Your browser must support WebP conversion.</p>}
      {errors.includes("form") && <div className="error">Please review the highlighted fields.</div>}
      {success && <div className="success">Application submitted for approval. Your card becomes official only after an administrator approves it.</div>}
    </form><ProfilePreview form={form} /></div></main></>
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) { return <label className={`field ${error ? "invalid" : ""}`}><span>{label}{required && <b> *</b>}</span>{children}{error && <small>This field is required.</small>}</label> }

function ProfilePreview({ form }: { form: ProfileForm }) {

  return <aside className="preview-wrap"><div className="preview-caption">Live member ID preview</div><article className="member-card">

    <div className="card-header"><div className="id-brand"><strong>EMBRIONE</strong></div><span>MEMBER IDENTITY</span></div>

    <div className="card-body"><div className="avatar">{form.image ? <img src={form.image} alt="Profile preview" /> : <span>{initials(form.name)}</span>}</div>

      <div className="card-info"><Tag tone={accents[form.domain]}>{form.domain}</Tag><h2 title={form.name || "Your name here"}>{form.name || "Your name here"}</h2><h3>{form.position}</h3><div className="profile-metadata"><span><b>SRN</b>{form.srn || "—"}</span><span><b>BRANCH</b>{form.branch || "—"}</span><span><b>SEMESTER</b>{form.semester || "—"}</span></div></div>

    </div>

    <div className="card-bottom"><div className="id-footer-brand">EMBRIONE</div><div className="card-accent" /><span>PES UNIVERSITY</span><div className="preview-social">{form.linkedin && <span aria-label="LinkedIn">in</span>}{form.github && <span aria-label="GitHub">&lt;/&gt;</span>}</div></div>

  </article><p className="preview-note">This preview is personal, not an official membership card until your application is approved.</p></aside>

}



function Typewriter({ text, delay = 0, speed = 24, className = "", cursor = false }: { text: string; delay?: number; speed?: number; className?: string; cursor?: boolean }) {

  const [visible, setVisible] = useState("")

  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")

    setReducedMotion(media.matches)

    if (media.matches) { setVisible(text); return }

    setVisible("")

    let index = 0

    let timeout: number

    const start = window.setTimeout(() => {

      const type = () => {

        index += 1

        setVisible(text.slice(0, index))

        if (index < text.length) timeout = window.setTimeout(type, speed)

      }

      type()

    }, delay)

    return () => { window.clearTimeout(start); window.clearTimeout(timeout) }

  }, [text, delay, speed])

  return <span className={`${className} ${cursor && !reducedMotion && visible.length < text.length ? "typing-cursor" : ""}`} aria-label={text}>{visible || "\u00a0"}</span>

}

function Home() {

  return <><Nav active="home" /><main className="home-page"><section className="home-hero"><div className="hero-copy"><TechLabel><Typewriter text="// EXPLORE. BUILD. COLLABORATE." speed={28} cursor /></TechLabel><h1 className="type-headline"><Typewriter text="Curiosity starts here." delay={950} speed={34} cursor /><br /><em><Typewriter text="Ideas become reality." delay={1900} speed={34} cursor /></em></h1><p className="type-paragraph"><Typewriter text="Embrione is a student-driven technology community at PES University where developers, designers, and problem-solvers come together to explore new technologies, exchange ideas, and build things that matter." delay={3100} speed={12} /></p><div className="hero-actions"><button className="primary" onClick={() => navigate("/register")}>Create your member ID <span>→</span></button><button className="text-button" onClick={() => navigate("/team")}>Meet the team <span>↗</span></button></div></div>

    <aside className="community-panel"><TechLabel><Typewriter text="BUILT BY STUDENTS. DRIVEN BY CURIOSITY." delay={5200} speed={20} /></TechLabel><h2><Typewriter text="A place to turn the next idea into something real." delay={6100} speed={22} /></h2><p><Typewriter text="From experimenting with new technologies to collaborating on ambitious projects, Embrione is a space to learn, create, and grow alongside people who share your passion for technology." delay={7350} speed={9} /></p><div className="panel-rule"><span>Learn openly</span><span>Build thoughtfully</span></div></aside>

  </section><footer className="home-footer"><span className="footer-code">// OFFICIAL LINKS</span><a href="https://www.instagram.com/the_embrione.pesu/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://forms.gle/wt7yBu1zWApacGD79" target="_blank" rel="noreferrer">Embrione link / form ↗</a></footer></main></>

}



function Login({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {

  const [email, setEmail] = useState(""), [pass, setPass] = useState(""), [error, setError] = useState("")

  const [busy, setBusy] = useState(false)
  const go = async (event: FormEvent) => { event.preventDefault(); setError(""); if (!email || !pass) { setError("Enter your administrator credentials to continue."); return } setBusy(true); try { await onLogin(email.trim(), pass) } catch { setError("Login failed. Check your credentials and confirm this account has the admin role.") } finally { setBusy(false) } }

  return <><Nav active="admin" /><main className="login-page"><section><TechLabel>// ADMIN ACCESS</TechLabel><h1>Member <em>review.</em></h1><p>Review applications thoughtfully and keep the community growing in the right direction.</p></section><form className="login-box" onSubmit={go}><TechLabel>ADMIN LOGIN</TechLabel><h2>Welcome back.</h2><Field label="Email address"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@embrione.pes.edu" /></Field><Field label="Password"><input type="password" value={pass} onChange={(event) => setPass(event.target.value)} placeholder="Enter password" /></Field>{error && <div className="error">{error}</div>}<button className="primary wide" disabled={busy}>{busy ? "Signing in..." : <>Enter review console <span>→</span></>}</button><small className="secure">Administrator credentials are not stored in this interface.</small></form></main></>

}

function Dashboard({ members, onUpdate, onLogout, loading }: { members: Member[]; onUpdate: (id: string, status: Status) => Promise<void>; onLogout: () => void; loading: boolean }) {

  const [tab, setTab] = useState("Overview"), [notice, setNotice] = useState(""); const pending = members.filter((member) => member.status === "Pending"), approved = members.filter((member) => member.status === "Approved")

  const shown = tab === "Pending Applications" ? pending : tab === "Approved Members" ? approved : tab === "Rejected Applications" ? members.filter((member) => member.status === "Rejected") : pending

  const [busyId, setBusyId] = useState("")
  const act = async (id: string, status: Status) => { setBusyId(id); setNotice(""); try { await onUpdate(id, status); setNotice(`Application ${status.toLowerCase()}.`) } catch { setNotice("Could not update this application. Please try again.") } finally { setBusyId("") } }

  return <><Nav active="admin" /><div className="dashboard"><aside className="side"><Mark />{["Overview", "Pending Applications", "Approved Members", "Rejected Applications"].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}{item === "Pending Applications" && <b>{pending.length}</b>}</button>)}</aside><main className="dash-main"><div style={{display:"flex",justifyContent:"flex-end"}}><button className="reject" onClick={onLogout}>Sign out</button></div><TechLabel>// MEMBER MANAGEMENT</TechLabel><div className="dash-title"><div><h1>Member management</h1><p>Review the people shaping the next iteration of Embrione.</p></div></div><div className="stats"><Stat label="Total submissions" value={members.length} suffix="all time" tone="neutral" /><Stat label="Pending applications" value={pending.length} suffix="needs review" tone="orange" /><Stat label="Approved members" value={approved.length} suffix="in directory" tone="green" /></div><section className="applications"><div className="list-head"><div><h2>{tab}</h2><p>{shown.length} application{shown.length !== 1 ? "s" : ""} shown</p></div></div>{notice && <div className="success">{notice}</div>}{loading && <div className="empty">Loading applications…</div>}<div className="table">{shown.length ? shown.map((member) => <div className="app-row" key={member.id}><div className="small-avatar">{member.image ? <img src={member.image} alt="" /> : initials(member.name)}</div><div className="app-name"><b>{member.name}</b><small>{member.srn} · {member.source}</small></div><Tag tone={accents[member.domain]}>{member.domain}</Tag><span className="position">{member.position}</span><Tag tone={member.status === "Approved" ? "green" : member.status === "Rejected" ? "coral" : "orange"}>{member.status}</Tag>{member.status === "Pending" && <div className="actions"><button disabled={busyId === member.id} onClick={() => void act(member.id, "Approved")} className="approve">Approve</button><button disabled={busyId === member.id} onClick={() => void act(member.id, "Rejected")} className="reject">Reject</button></div>}</div>) : <div className="empty">No applications here. The queue is clear.</div>}</div></section></main></div></>

}

function Stat({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: string }) { return <article className={`stat ${tone}`}><p>{label}</p><strong>{String(value).padStart(2, "0")}</strong><span>{suffix}</span></article> }



function Team({ roster }: { roster: Member[] }) {

  const [domain, setDomain] = useState("All Domains"), [position, setPosition] = useState("All Positions"), [search, setSearch] = useState("")

  const members = useMemo(() => roster.filter((member) => member.status === "Approved" && (domain === "All Domains" || member.domain === domain) && (position === "All Positions" || member.position === position) && member.name.toLowerCase().includes(search.toLowerCase())), [roster, domain, position, search])

  return <><Nav active="team" /><main className="page team-page"><section className="team-hero"><div><TechLabel>// PEOPLE BEHIND EMBRIONE</TechLabel><h1>Meet the people<br />building <em>what’s next.</em></h1><p>A community of builders, designers, and problem-solvers.</p></div><div className="member-count"><strong>{String(members.length).padStart(2, "0")}</strong><span>APPROVED<br />MEMBERS</span></div></section><section className="directory-tools"><div className="filter-group"><p>FILTER BY DOMAIN</p><div>{["All Domains", ...domains].map((item) => <button onClick={() => setDomain(item)} className={domain === item ? "active" : ""} key={item}>{item}</button>)}</div></div><div className="filter-group"><p>FILTER BY ROLE</p><div>{["All Positions", ...positions].map((item) => <button onClick={() => setPosition(item)} className={position === item ? "active" : ""} key={item}>{item}</button>)}</div></div><label className="search">Search <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="people" /></label></section><div className="results-line"><span>DIRECTORY / <b>{members.length} MEMBERS</b></span><span>Only approved members are shown.</span></div><section className="team-grid">{members.length ? members.map((member) => <article className="team-card" key={member.id}><div className="portrait">{member.image ? <img src={member.image} alt={member.name} /> : <div className="portrait-initials">{initials(member.name)}</div>}<Tag tone={accents[member.domain]}>{member.domain}</Tag></div><div className="team-info"><p className="role">{member.position}</p><h2>{member.name}</h2><p className="member-meta">{member.branch} · SEM {member.semester}{member.source === "Demo" && " · DEMO"}</p><p className="bio">{member.bio}</p><div className="social">
  {safeProfileUrl(member.linkedin) && (
    <a href={safeProfileUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`} title="LinkedIn">
      in
    </a>
  )}
  {safeProfileUrl(member.github) && (
    <a href={safeProfileUrl(member.github)} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} GitHub`} title="GitHub">
      gh
    </a>
  )}
  <span>{member.id}</span>
</div></div></article>) : <div className="empty team-empty">No people match these filters.<button onClick={() => { setDomain("All Domains"); setPosition("All Positions"); setSearch("") }}>Reset filters</button></div>}</section></main></>

}

type DbMember = {
  id: string; name: string; domain: string; position: string; srn: string; email: string;
  linkedin_url: string | null; github_url: string | null; branch: string | null;
  semester: number | null; bio: string | null; photo_url: string | null; status: string;
}

function fromDb(row: DbMember): Member {
  return { id: row.id, name: row.name, domain: row.domain as Domain, position: row.position as Position,
    srn: row.srn, email: row.email, linkedin: row.linkedin_url ?? "", github: row.github_url ?? "",
    branch: row.branch ?? "", semester: row.semester == null ? "" : String(row.semester), bio: row.bio ?? "",
    image: row.photo_url ? supabase.storage.from("member-photos").getPublicUrl(row.photo_url).data.publicUrl : "", status: row.status[0].toUpperCase() + row.status.slice(1) as Status, source: "Registration" }
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [logged, setLogged] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [teamMembers, setTeamMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { const update = () => setPath(window.location.pathname); addEventListener("popstate", update); return () => removeEventListener("popstate", update) }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("members").select("id,name,domain,position,srn,email,linkedin_url,github_url,branch,semester,bio,photo_url,status").order("created_at", { ascending: false })
      if (error) throw error
      setMembers(((data ?? []) as DbMember[]).map(fromDb))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    let cancelled = false
    async function loadPublicTeam() {
      const { data, error } = await supabase.rpc("get_public_team_members")
      if (error) { console.error("Could not load public team members:", error.message); return }
      if (cancelled) return
      setTeamMembers(((data ?? []) as Array<Omit<DbMember, "srn" | "email" | "status"> & { status?: string }>).map((row) => ({
        id: row.id, name: row.name, domain: row.domain as Domain, position: row.position as Position,
        srn: "", email: "", linkedin: row.linkedin_url ?? "", github: row.github_url ?? "", branch: row.branch ?? "",
        semester: row.semester == null ? "" : String(row.semester), bio: row.bio ?? "", image: row.photo_url ? supabase.storage.from("member-photos").getPublicUrl(row.photo_url).data.publicUrl : "",
        status: "Approved", source: "Registration"
      })))
    }
    void loadPublicTeam()
    return () => { cancelled = true }
  }, [])

  const register = async (profile: ProfileForm) => {
    let photoPath: string | null = null
    if (profile.image) {
      const response = await fetch(profile.image)
      const blob = await response.blob()
      const filePath = `${crypto.randomUUID()}.webp`
      const { error: uploadError } = await supabase.storage.from("member-photos").upload(filePath, blob, { contentType: "image/webp", upsert: false })
      if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)
      photoPath = filePath
    }
    const { error } = await supabase.from("members").insert({
      name: profile.name, domain: profile.domain, position: profile.position, srn: profile.srn,
      email: profile.email, linkedin_url: profile.linkedin || null, github_url: profile.github || null,
      branch: profile.branch || null, semester: Number(profile.semester), bio: profile.bio,
      photo_url: photoPath, status: "pending"
    })
    if (error) {
      if (photoPath) await supabase.storage.from("member-photos").remove([photoPath])
      if (error.code === "23505") throw new Error("This SRN already has an application.")
      throw new Error(`Could not save application: ${error.message}`)
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const role = data.user?.app_metadata?.role
    if (role !== "admin") { await supabase.auth.signOut(); throw new Error("This account is not an administrator.") }
    setLogged(true)
    await loadMembers()
  }

  const logout = async () => { await supabase.auth.signOut(); setLogged(false); setMembers([]) }

  const update = async (id: string, status: Status) => {
    const { error } = await supabase.from("members").update({ status: status.toLowerCase() }).eq("id", id)
    if (error) throw error
    setMembers((current) => current.map((member) => member.id === id ? { ...member, status } : member))
    if (status === "Approved") {
      const { data } = await supabase.rpc("get_public_team_members")
      if (data) setTeamMembers((data as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id), name: String(row.name), domain: String(row.domain) as Domain, position: String(row.position) as Position,
        srn: "", email: "", linkedin: String(row.linkedin_url ?? ""), github: String(row.github_url ?? ""),
        branch: String(row.branch ?? ""), semester: String(row.semester ?? ""), bio: String(row.bio ?? ""), image: row.photo_url ? supabase.storage.from("member-photos").getPublicUrl(String(row.photo_url)).data.publicUrl : "", status: "Approved", source: "Registration"
      })))
    } else setTeamMembers((current) => current.filter((member) => member.id !== id))
  }

  return path === "/admin" ? (logged ? <Dashboard members={members} onUpdate={update} onLogout={() => void logout()} loading={loading} /> : <Login onLogin={login} />) : path === "/team" ? <Team roster={teamMembers} /> : path === "/register" ? <Register onRegister={register} existingSrns={[]} /> : <Home />
}
