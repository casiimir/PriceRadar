# Price Radar - Piano di Sviluppo Dettagliato

## Indice
- [Fase 1: Setup Iniziale e Infrastruttura](#fase-1-setup-iniziale-e-infrastruttura)
- [Fase 2: Database e Autenticazione](#fase-2-database-e-autenticazione)
- [Fase 3: UI Base e Sistema Reattivo](#fase-3-ui-base-e-sistema-reattivo)
- [Fase 4: Backend Worker e Orchestrazione](#fase-4-backend-worker-e-orchestrazione)
- [Fase 5: Web Scraping con Firecrawl](#fase-5-web-scraping-con-firecrawl)
- [Fase 6: Integrazione AI](#fase-6-integrazione-ai)
- [Fase 7: Sistema di Notifiche Real-time](#fase-7-sistema-di-notifiche-real-time)
- [Fase 8: Monetizzazione e Piani](#fase-8-monetizzazione-e-piani)
- [Fase 9: Monitoring e Error Tracking](#fase-9-monitoring-e-error-tracking)
- [Fase 10: Rifinitura e Ottimizzazione](#fase-10-rifinitura-e-ottimizzazione)
- [Fase 11: Testing e QA](#fase-11-testing-e-qa)
- [Fase 12: Deploy e CI/CD](#fase-12-deploy-e-cicd)
- [Fase 13: Demo e Presentazione](#fase-13-demo-e-presentazione)

---

## Fase 1: Setup Iniziale e Infrastruttura

### Task 1.1: Configurazione Repository
- [ ] Creare repository GitHub per il progetto
- [ ] Configurare `.gitignore` per Node.js/TypeScript
- [ ] Creare branch `main` e `develop`
- [ ] Configurare CodeRabbit per AI-powered code review
- [ ] Aggiungere README.md con descrizione progetto

### Task 1.2: Inizializzazione TanStack Start
- [ ] Eseguire `npm create tanstack-start@latest`
- [ ] Configurare TypeScript (`tsconfig.json`)
- [ ] Verificare struttura progetto base
- [ ] Testare dev server locale
- [ ] Configurare ESLint e Prettier

### Task 1.3: Setup Tailwind CSS e daisyUI
- [ ] Installare Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Eseguire `npx tailwindcss init -p`
- [ ] Installare daisyUI: `npm install daisyui`
- [ ] Configurare `tailwind.config.js` con daisyUI plugin
- [ ] Configurare tema "Night" di daisyUI
- [ ] Aggiungere direttive Tailwind in CSS globale
- [ ] Testare con componente di esempio

### Task 1.4: Configurazione Ambiente di Sviluppo
- [ ] Creare file `.env.local` per variabili d'ambiente
- [ ] Documentare variabili necessarie in `.env.example`
- [ ] Configurare hot-reload
- [ ] Setup VS Code workspace settings (opzionale)

---

## Fase 2: Database e Autenticazione

### Task 2.1: Setup Convex
- [ ] Installare Convex: `npm install convex`
- [ ] Eseguire `npx convex init`
- [ ] Collegare progetto Convex al dashboard
- [ ] Configurare variabili d'ambiente Convex
- [ ] Verificare connessione con Convex dashboard

### Task 2.2: Definizione Schema Database
- [ ] Creare `convex/schema.ts`
- [ ] Definire tabella `users` con campi:
  - `name: v.string()`
  - `email: v.string()`
  - `plan: v.union(v.literal("free"), v.literal("pro"))`
  - `autumnCustomerId: v.optional(v.string())`
  - Index `by_email`
- [ ] Definire tabella `monitors` con campi:
  - `userId: v.id("users")`
  - `queryText: v.string()`
  - `queryJson: v.any()`
  - `status: v.string()` (active/paused/error)
  - `sites: v.array(v.string())`
  - `frequencyMinutes: v.number()`
  - `createdAt: v.number()`
  - Index `by_userId`
- [ ] Definire tabella `offers` con campi:
  - `monitorId: v.id("monitors")`
  - `userId: v.id("users")`
  - `title: v.string()`
  - `price: v.number()`
  - `currency: v.string()`
  - `url: v.string()`
  - `siteName: v.string()`
  - `snippet: v.string()`
  - `imageUrl: v.optional(v.string())`
  - `status: v.string()` (new/archived)
  - `foundAt: v.number()`
  - Index `by_monitorId` e `by_userId`
- [ ] Push schema a Convex: `npx convex dev`

### Task 2.3: Setup Convex Auth
- [ ] Installare Convex Auth: `npm install @convex-dev/auth`
- [ ] Configurare provider OAuth (Google/GitHub)
- [ ] Creare `convex/auth.config.ts`
- [ ] Implementare funzioni auth in `convex/auth.ts`
- [ ] Testare flow di autenticazione

### Task 2.4: Query e Mutations Base
- [ ] Creare `convex/users.ts`:
  - Query `getCurrentUser()`
  - Mutation `createUser()`
  - Mutation `updateUserPlan()`
- [ ] Creare `convex/monitors.ts`:
  - Query `getAll()` (per userId)
  - Query `getById(monitorId)`
  - Mutation `create()`
  - Mutation `updateStatus()`
  - Mutation `delete()`
- [ ] Creare `convex/offers.ts`:
  - Query `getByMonitorId(monitorId)`
  - Query `getByUserId(userId)`
  - Mutation `create()`
  - Mutation `archiveOffer(offerId)`
- [ ] Testare queries/mutations con Convex dashboard

---

## Fase 3: UI Base e Sistema Reattivo

### Task 3.1: Layout e Navigazione
- [ ] Creare componente `Layout` con:
  - Header/Navbar (daisyUI)
  - Footer
  - Container principale
- [ ] Implementare Navbar con:
  - Logo "Price Radar"
  - Link Dashboard
  - Pulsante Login/Logout
  - Badge Piano (Free/Pro)
- [ ] Configurare routing con TanStack Router
- [ ] Creare pagine base:
  - `/` (Landing page)
  - `/dashboard` (Dashboard principale)
  - `/pricing` (Pagina prezzi)

### Task 3.2: Landing Page
- [ ] Design Hero section con:
  - Titolo principale
  - Sottotitolo value proposition
  - CTA "Inizia Gratis"
  - Screenshot/mockup app
- [ ] Sezione "Come Funziona" (3 step)
- [ ] Sezione "Perché Price Radar" (USP)
- [ ] Sezione Pricing (preview piani)
- [ ] Footer con link e info

### Task 3.3: Sistema di Autenticazione UI
- [ ] Creare componente `AuthButton`
- [ ] Implementare modal/pagina Login
- [ ] Gestire stato utente con Convex Auth
- [ ] Creare HOC/wrapper per route protette
- [ ] Redirect automatico dopo login
- [ ] Implementare logout

### Task 3.4: Dashboard - Struttura Base
- [ ] Creare layout Dashboard:
  - Sidebar con statistiche
  - Area principale per monitors
  - Sezione "Quick Stats"
- [ ] Implementare hook `useQuery` per caricare monitors
- [ ] Implementare hook `useQuery` per caricare user data
- [ ] Mostrare stato piano utente
- [ ] Mostrare conteggio monitors attivi

### Task 3.5: Componente "AI Prompt Bar"
- [ ] Creare componente `MonitorInput`:
  - Textarea grande per query NL
  - Placeholder esplicativo
  - Character counter (opzionale)
  - Pulsante "Monitora" (btn-primary)
- [ ] Styling con daisyUI Hero/Card
- [ ] Gestire stato input
- [ ] Validazione input (min length)

### Task 3.6: Componente "Monitor Card"
- [ ] Creare componente `MonitorCard`:
  - Mostra `queryText`
  - Badge per `status` (attivo/pausa/errore)
  - Mostra frequenza (`frequencyMinutes`)
  - Mostra siti monitorati
  - Data creazione
- [ ] Azioni:
  - Pulsante Pausa/Riprendi
  - Pulsante Elimina (con conferma)
  - Pulsante "Vedi Offerte"
- [ ] Styling responsive con daisyUI Card
- [ ] Animazioni hover

### Task 3.7: Componente "Offer Card"
- [ ] Creare componente `OfferCard`:
  - Immagine prodotto (se disponibile)
  - Titolo offerta
  - Prezzo con badge colorato
  - Nome sito
  - Snippet generato AI
  - Data trovata
- [ ] Azioni:
  - Pulsante "Vedi Offerta" (link esterno)
  - Pulsante "Ignora" (archivia)
- [ ] Styling con daisyUI Card
- [ ] Hover effects e animazioni

### Task 3.8: Lista Monitors e Offers
- [ ] Implementare `MonitorsList` component:
  - Map su array monitors
  - Empty state (nessun monitor)
  - Loading state
- [ ] Per ogni monitor, caricare offers relative
- [ ] Implementare `OffersList` component:
  - Mostra offerte per monitor
  - Empty state (nessuna offerta)
  - Ordinamento per data
- [ ] Layout grid responsive

### Task 3.9: Test Sistema Reattivo Base
- [ ] Creare mutation test per aggiungere monitor
- [ ] Verificare aggiornamento real-time della UI
- [ ] Testare con più tab browser aperti
- [ ] Verificare sincronizzazione dati
- [ ] Testare eliminazione e update

---

## Fase 4: Backend Worker e Orchestrazione

### Task 4.1: Setup Cloudflare Workers
- [ ] Installare Wrangler CLI: `npm install -g wrangler`
- [ ] Autenticare Cloudflare: `wrangler login`
- [ ] Creare nuovo Worker: `wrangler init price-radar-worker`
- [ ] Configurare `wrangler.toml`:
  - Nome worker
  - Account ID
  - Compatibilità date
  - Variabili d'ambiente

### Task 4.2: Configurazione Cron Triggers
- [ ] Aggiungere cron triggers in `wrangler.toml`:
  - Trigger ogni 3 minuti per utenti Pro
  - Trigger ogni 30 minuti per utenti Free
- [ ] Implementare handler `scheduled()` in worker
- [ ] Testare trigger locale con `wrangler dev`
- [ ] Log di debug per verificare esecuzione

### Task 4.3: Connessione Convex da Worker
- [ ] Installare Convex client nel Worker
- [ ] Configurare autenticazione Worker -> Convex
- [ ] Creare utility `getConvexClient()` in worker
- [ ] Testare lettura dati da Convex
- [ ] Gestire errori di connessione

### Task 4.4: Logica di Orchestrazione Base
- [ ] Implementare funzione `fetchActiveMonitors()`:
  - Query a Convex per monitors attivi
  - Filtrare per frequenza (basato su ultimo run)
  - Separare monitors Free vs Pro
- [ ] Implementare funzione `processMonitor(monitor)`:
  - Stub iniziale (solo log)
  - Gestione errori per singolo monitor
- [ ] Implementare loop principale nel cron handler
- [ ] Rate limiting e throttling

### Task 4.5: Test Plumbing End-to-End
- [ ] Creare monitor di test in Convex
- [ ] Worker legge monitor e scrive offerta FAKE
- [ ] Verificare che UI mostra offerta fake in real-time
- [ ] Testare con multipli monitors
- [ ] Verificare gestione errori

### Task 4.6: Sistema di Lock e Deduplicazione
- [ ] Implementare lock su monitors (evitare run paralleli)
- [ ] Salvare `lastRunAt` timestamp in monitors
- [ ] Deduplicare offerte per URL
- [ ] Gestire race conditions

---

## Fase 5: Web Scraping con Firecrawl

### Task 5.1: Setup Firecrawl
- [ ] Registrare account Firecrawl
- [ ] Ottenere API key
- [ ] Installare SDK: `npm install @firecrawl/client`
- [ ] Configurare client nel Worker
- [ ] Testare connessione con endpoint test

### Task 5.2: URL Builder per Siti Target
- [ ] Creare `urlBuilders.ts` nel Worker:
  - Funzione `buildEbaySearchUrl(queryJson)`
  - Funzione `buildSubitoSearchUrl(queryJson)`
  - (Altri siti se necessario)
- [ ] Parametrizzare query basandosi su `queryJson`:
  - Item/keyword
  - Price range
  - Location
  - Condition (new/used)
- [ ] Test URL generation con vari input

### Task 5.3: Integrazione Firecrawl nel Worker
- [ ] Implementare funzione `scrapeWithFirecrawl(url)`:
  - Chiamata API Firecrawl
  - Configurare formato output (markdown/text)
  - Timeout e retry logic
  - Error handling
- [ ] Testare scraping con URL reale di eBay
- [ ] Verificare qualità contenuto estratto
- [ ] Log dei contenuti per debug

### Task 5.4: Gestione Multi-Sito
- [ ] Creare mapping `siteName -> urlBuilder`
- [ ] Implementare loop per ogni sito in `monitor.sites[]`
- [ ] Eseguire scraping parallelo (con limit)
- [ ] Aggregare risultati
- [ ] Gestire fallimento parziale (alcuni siti ok, altri no)

### Task 5.5: Rate Limiting e Caching
- [ ] Implementare rate limiting per Firecrawl API
- [ ] Cache semplice per evitare scrape duplicati
- [ ] Backoff esponenziale su errori 429
- [ ] Monitoring quote API

---

## Fase 6: Integrazione AI

### Task 6.1: Setup Cloudflare AI
- [ ] Abilitare Workers AI nel dashboard Cloudflare
- [ ] Configurare binding AI in `wrangler.toml`
- [ ] Testare connessione con modello text-generation
- [ ] Esplorare modelli disponibili (es. Llama, Mistral)

### Task 6.2: AI (A) - Query Parser
- [ ] Creare Convex Action `parseUserQuery(queryText)`:
  - Chiamare Cloudflare AI Workers API
  - Prompt engineering per parsing
  - Estrarre: item, price_max, price_min, condition, location, brand, ecc.
  - Output JSON strutturato
- [ ] Testare con varie query:
  - "RTX 4080 usata < 800€"
  - "Borsa Gucci vintage, spedita in Italia"
  - "MacBook Pro M2, nuovo, massimo 2000€"
- [ ] Validazione output AI
- [ ] Fallback se AI non capisce

### Task 6.3: Integrazione AI Parser nella UI
- [ ] Collegare `MonitorInput` alla action `parseUserQuery`
- [ ] Mostrare loading state durante parsing
- [ ] Mostrare preview del JSON parsato (opzionale)
- [ ] Permettere editing manuale del JSON
- [ ] Salvare in `monitors.queryJson`

### Task 6.4: AI (B) - Offer Extractor
- [ ] Implementare funzione `extractOffersWithAI(scrapedContent, queryJson)` nel Worker:
  - Prompt per estrarre prodotti da contenuto scraped
  - Filtrare solo match rilevanti rispetto a queryJson
  - Output: array di {title, price, currency, url, snippet}
- [ ] Testare con contenuto reale da Firecrawl
- [ ] Tuning prompt per accuratezza
- [ ] Gestire output malformato

### Task 6.5: Prompt Engineering e Ottimizzazione
- [ ] Creare template prompts riutilizzabili
- [ ] Ottimizzare lunghezza prompt (token limit)
- [ ] Testare performance con vari modelli AI
- [ ] A/B test accuratezza estrazione
- [ ] Documentare best practices

### Task 6.6: Integrazione Completa nel Worker
- [ ] Modificare `processMonitor()`:
  1. Costruire URL con urlBuilder
  2. Scrape con Firecrawl
  3. Estrarre offers con AI
  4. Salvare offers in Convex
- [ ] Testare flusso completo end-to-end
- [ ] Verificare qualità offerte estratte
- [ ] Filtrare duplicati

---

## Fase 7: Sistema di Notifiche Real-time

### Task 7.1: Toast Notifications
- [ ] Installare libreria toast (o usare daisyUI alert)
- [ ] Creare hook `useOfferNotification()`:
  - Subscribe a nuove offers
  - Trigger toast su nuova offerta
  - Audio notification (opzionale)
- [ ] Implementare Toast component:
  - Mostra titolo offerta
  - Mostra prezzo
  - Link rapido "Vedi"
  - Auto-dismiss dopo 10s
- [ ] Testare con offerte fake

### Task 7.2: Real-time Updates su Dashboard
- [ ] Verificare che `useQuery` si aggiorna automaticamente
- [ ] Animare nuove offer cards (fade-in)
- [ ] Badge "NEW" su offerte recenti
- [ ] Sound effect su nuova offerta (opt-in)

### Task 7.3: Notifiche Email (Piano Pro)
- [ ] Setup servizio email (es. Resend, SendGrid)
- [ ] Creare template email "Nuova Offerta Trovata"
- [ ] Implementare Convex Action `sendEmailNotification()`:
  - Trigger su nuova offer per utente Pro
  - Inviare email con dettagli offerta
  - Link diretto all'offerta
- [ ] Configurare unsubscribe/preferences
- [ ] Testare deliverability

### Task 7.4: Push Notifications (Futuro - Opzionale)
- [ ] Setup Web Push API
- [ ] Implementare service worker
- [ ] Request permission utente
- [ ] Inviare push notification su nuova offerta
- [ ] Testare su vari browser

---

## Fase 8: Monetizzazione e Piani

### Task 8.1: Setup Autumn
- [ ] Registrare account Autumn
- [ ] Creare prodotto "Price Radar Pro"
- [ ] Configurare prezzo €7.99/mese
- [ ] Ottenere API keys
- [ ] Setup webhook endpoint URL

### Task 8.2: Pagina Pricing
- [ ] Creare `/pricing` route
- [ ] Design tabella confronto piani (Free vs Pro)
- [ ] Evidenziare features chiave:
  - Numero monitors
  - Frequenza
  - Siti supportati
  - Notifiche
- [ ] CTA "Upgrade a Pro"
- [ ] Link checkout Autumn

### Task 8.3: Checkout Flow
- [ ] Implementare redirect a Autumn checkout
- [ ] Passare userId/email come metadata
- [ ] Configurare success/cancel URLs
- [ ] Testare checkout flow completo

### Task 8.4: Webhook Handler
- [ ] Creare HTTP endpoint Convex `handleAutumnWebhook`:
  - Verificare signature webhook
  - Parse event type (payment success, cancellation, etc.)
  - Aggiornare `users.plan`
  - Salvare `autumnCustomerId`
- [ ] Testare con webhook test di Autumn
- [ ] Gestire idempotenza
- [ ] Logging eventi pagamento

### Task 8.5: Paywall UI
- [ ] Creare Modal "Upgrade Required"
- [ ] Trigger modal quando utente Free tenta:
  - Creare secondo monitor
  - Cambiare frequenza
  - Aggiungere sito extra
- [ ] Mostrare benefici piano Pro
- [ ] CTA diretto a checkout

### Task 8.6: Gestione Limiti Piano
- [ ] Implementare validazione server-side (Convex):
  - Bloccare creazione monitor se limite raggiunto
  - Bloccare cambio frequenza per Free
  - Bloccare multi-sito per Free
- [ ] Mostrare messaggi errore chiari
- [ ] UI disabilitata per azioni non permesse

### Task 8.7: Gestione Cancellazione e Downgrade
- [ ] Implementare logica downgrade Pro -> Free:
  - Pausare monitors in eccesso
  - Cambiare frequenza a 30min
  - Disabilitare notifiche email
- [ ] Comunicare chiaramente cosa succede
- [ ] Permettere scelta quali monitor mantenere

---

## Fase 9: Monitoring e Error Tracking

### Task 9.1: Setup Sentry
- [ ] Creare progetto Sentry
- [ ] Installare SDK frontend: `npm install @sentry/react`
- [ ] Installare SDK Cloudflare Worker: `npm install @sentry/cloudflare`
- [ ] Configurare DSN in environment variables

### Task 9.2: Integrazione Sentry Frontend
- [ ] Inizializzare Sentry in app root
- [ ] Configurare integrazione TanStack Router
- [ ] Setup error boundary
- [ ] Configurare breadcrumbs
- [ ] Testare con errore forzato
- [ ] Configurare source maps

### Task 9.3: Integrazione Sentry Worker
- [ ] Inizializzare Sentry nel Worker
- [ ] Wrap handler principale con Sentry
- [ ] Log errori scraping
- [ ] Log errori AI
- [ ] Configurare performance monitoring
- [ ] Testare con errore forzato

### Task 9.4: Custom Events e Alerts
- [ ] Tracciare eventi custom:
  - Monitor creato
  - Offerta trovata
  - Upgrade a Pro
  - Errore parsing AI
- [ ] Configurare alerts per errori critici
- [ ] Setup notification Slack/Email per alerts

### Task 9.5: Performance Monitoring
- [ ] Abilitare performance tracking Sentry
- [ ] Monitorare tempi scraping
- [ ] Monitorare tempi risposta AI
- [ ] Dashboard performance Cloudflare
- [ ] Identificare bottleneck

---

## Fase 10: Rifinitura e Ottimizzazione

### Task 10.1: UI/UX Polish
- [ ] Revisione completa design:
  - Consistenza colori
  - Spacing uniforme
  - Typography coerente
- [ ] Micro-interazioni:
  - Loading spinners
  - Skeleton screens
  - Transizioni smooth
  - Hover states
- [ ] Accessibility:
  - ARIA labels
  - Keyboard navigation
  - Contrast check
  - Screen reader test

### Task 10.2: Mobile Responsiveness
- [ ] Test su vari breakpoint:
  - Mobile (320px-480px)
  - Tablet (768px-1024px)
  - Desktop (1024px+)
- [ ] Ottimizzare Dashboard per mobile
- [ ] Hamburger menu per mobile
- [ ] Touch-friendly buttons
- [ ] Test su device reali

### Task 10.3: Dark Mode (già incluso con Night theme)
- [ ] Verificare leggibilità in dark mode
- [ ] Assicurare contrasti adeguati
- [ ] Test immagini/icone in dark mode
- [ ] Toggle opzionale light/dark (futuro)

### Task 10.4: Ottimizzazione Performance Frontend
- [ ] Code splitting routes
- [ ] Lazy loading componenti pesanti
- [ ] Ottimizzare bundle size
- [ ] Compressione immagini
- [ ] Implementare PWA (opzionale)
- [ ] Lighthouse audit e ottimizzazioni

### Task 10.5: Ottimizzazione Worker
- [ ] Ridurre dimensione bundle Worker
- [ ] Ottimizzare cold start time
- [ ] Parallelizzare operazioni quando possibile
- [ ] Caching intelligente
- [ ] Ridurre chiamate Convex

### Task 10.6: SEO e Meta Tags
- [ ] Configurare meta tags per ogni pagina
- [ ] Open Graph tags per social sharing
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] Schema markup per prodotto

### Task 10.7: Content e Copy
- [ ] Revisione testi landing page
- [ ] Tooltip esplicativi
- [ ] Help text nei form
- [ ] FAQ section
- [ ] Termini e condizioni
- [ ] Privacy policy

---

## Fase 11: Testing e QA

### Task 11.1: Setup Testing Framework
- [ ] Installare Vitest: `npm install -D vitest`
- [ ] Configurare test environment
- [ ] Setup testing library: `npm install -D @testing-library/react`
- [ ] Configurare coverage

### Task 11.2: Unit Tests
- [ ] Test utility functions:
  - URL builders
  - Data formatters
  - Validators
- [ ] Test AI prompt builders
- [ ] Test Convex queries/mutations (con mock)
- [ ] Coverage target: 70%+

### Task 11.3: Integration Tests
- [ ] Test flow creazione monitor end-to-end
- [ ] Test flow upgrade a Pro
- [ ] Test worker scheduling logic
- [ ] Test Firecrawl integration (con mock)

### Task 11.4: E2E Tests (opzionale con Playwright)
- [ ] Setup Playwright
- [ ] Test user journey completo:
  - Registrazione
  - Creazione monitor
  - Ricezione offerta
  - Upgrade
- [ ] Test responsive

### Task 11.5: Manual QA
- [ ] Creare checklist QA
- [ ] Test su browser diversi (Chrome, Firefox, Safari)
- [ ] Test scenari edge case:
  - Connessione lenta
  - AI non risponde
  - Scraping fallisce
  - Webhook duplicato
- [ ] Bug fixing

### Task 11.6: Load Testing
- [ ] Simulare carico con più utenti
- [ ] Test scalabilità Worker con molti monitors
- [ ] Verificare limiti Convex
- [ ] Test rate limiting

---

## Fase 12: Deploy e CI/CD

### Task 12.1: Setup Netlify
- [ ] Collegare repository GitHub a Netlify
- [ ] Configurare build settings:
  - Build command
  - Publish directory
  - Environment variables
- [ ] Configurare auto-deploy da `main` branch
- [ ] Setup preview deploys per PR

### Task 12.2: Environment Variables
- [ ] Configurare env vars su Netlify:
  - Convex URL e keys
  - Sentry DSN
  - Autumn keys
- [ ] Configurare env vars su Cloudflare Workers:
  - Convex credentials
  - Firecrawl API key
  - AI binding
  - Sentry DSN
- [ ] Documentare tutte le env vars

### Task 12.3: Deploy Worker su Cloudflare
- [ ] Deploy iniziale: `wrangler deploy`
- [ ] Configurare cron triggers in production
- [ ] Verificare logs Cloudflare
- [ ] Test Worker in production

### Task 12.4: CI/CD Pipeline
- [ ] Creare GitHub Actions workflow:
  - Lint e format check
  - Run tests
  - Build check
  - Deploy preview (opzionale)
- [ ] Configurare branch protection rules
- [ ] Auto-deploy su merge a main

### Task 12.5: Database Migrations
- [ ] Strategia per schema changes Convex
- [ ] Documentare processo migration
- [ ] Backup strategy

### Task 12.6: Monitoring Production
- [ ] Verificare Sentry riceve eventi production
- [ ] Setup uptime monitoring (es. UptimeRobot)
- [ ] Alert su downtime
- [ ] Dashboard con metriche chiave

---

## Fase 13: Demo e Presentazione

### Task 13.1: Preparazione Demo Video
- [ ] Scrivere script demo (2-3 minuti):
  - Intro problema
  - Mostrare UI e creazione monitor
  - Trigger manuale worker (o wait real-time)
  - Mostrare notifica e offerta
  - Mostrare upgrade Pro
- [ ] Registrare screen capture (OBS, Loom)
- [ ] Editing video (cut, transizioni)
- [ ] Aggiungere musica sottofondo
- [ ] Export in alta qualità

### Task 13.2: Landing Page per Hackathon
- [ ] Sezione dedicata "Built for TanStack Start Hackathon"
- [ ] Loghi sponsor utilizzati
- [ ] Spiegazione stack tecnologico
- [ ] Link a GitHub repo
- [ ] Link demo video

### Task 13.3: Documentazione Progetto
- [ ] README dettagliato con:
  - Descrizione progetto
  - Stack tecnologico
  - Setup istruzioni
  - Architecture diagram
  - Screenshots
- [ ] ARCHITECTURE.md con diagrammi
- [ ] API documentation (se applicabile)
- [ ] Contributing guide (se open source)

### Task 13.4: Social Media Content
- [ ] Post LinkedIn:
  - Storia del progetto
  - Sfide tecniche
  - Tag sponsor
  - Link demo
- [ ] Post Twitter/X:
  - Thread su tech stack
  - GIF/video teaser
  - Tag sponsor
- [ ] Dev.to article (opzionale):
  - Deep dive tecnico
  - Lessons learned

### Task 13.5: Submission Hackathon
- [ ] Verificare requisiti submission
- [ ] Compilare form submission
- [ ] Includere:
  - Link demo video
  - Link repo GitHub
  - Link live app
  - Descrizione progetto
  - Screenshot
- [ ] Submit prima della deadline!

---

## Task Bonus e Feature Future

### Bonus 1: Advanced Features
- [ ] Cronologia completa offerte (Pro)
- [ ] Export dati offerte (CSV/JSON)
- [ ] Grafici prezzo nel tempo
- [ ] Alert custom (webhook, Telegram, Slack)
- [ ] Multi-lingua (i18n)

### Bonus 2: AI Enhancements
- [ ] RAG con Vectorize per migliorare AI
- [ ] Sentiment analysis venditori
- [ ] Previsione trend prezzi
- [ ] Suggerimenti automatici query

### Bonus 3: Più Siti Supportati
- [ ] Aggiungere Amazon scraper
- [ ] Aggiungere Vinted
- [ ] Aggiungere Wallapop
- [ ] Aggiungere forum specializzati (r/hardwareswap)

### Bonus 4: Mobile App
- [ ] React Native app
- [ ] Push notifications native
- [ ] Face ID/Touch ID

---

## Metriche di Successo

### KPI Tecnici
- [ ] Latenza media notifica < 5 minuti (Pro)
- [ ] Uptime > 99.5%
- [ ] Accuratezza AI parsing > 90%
- [ ] Zero errori critici in Sentry
- [ ] Lighthouse score > 90

### KPI Business (post-hackathon)
- [ ] 100+ utenti registrati nella prima settimana
- [ ] 10+ conversioni Free -> Pro nel primo mese
- [ ] Retention rate > 60% a 30 giorni

---

## Timeline Stimata

**Settimana 1:**
- Fase 1-2: Setup e Database (2 giorni)
- Fase 3: UI Base (3 giorni)
- Fase 4: Backend Worker (2 giorni)

**Settimana 2:**
- Fase 5: Web Scraping (2 giorni)
- Fase 6: Integrazione AI (3 giorni)
- Fase 7: Notifiche (2 giorni)

**Settimana 3:**
- Fase 8: Monetizzazione (2 giorni)
- Fase 9: Monitoring (1 giorno)
- Fase 10: Polish (2 giorni)
- Fase 11: Testing (2 giorni)

**Settimana 4:**
- Fase 12: Deploy (1 giorno)
- Fase 13: Demo e Presentazione (2 giorni)
- Buffer per imprevisti (4 giorni)

**Totale stimato: 3-4 settimane**

---

## Note Finali

Questo piano è ambizioso ma fattibile. Le priorità chiave sono:

1. **Magic Moment First**: Focus su Fase 4-6 per creare l'esperienza "wow"
2. **Iterativo**: Non aspettare perfezione, iterare velocemente
3. **Demo-driven**: Ogni feature deve essere "demo-able"
4. **Sponsor-friendly**: Usare TUTTI gli sponsor in modo significativo

Buon sviluppo! 🚀
