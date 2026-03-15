import { useEffect, useState } from 'react'
import tiamoLogo from '../assets/tiamo-logo.png'
import {
  aboutContent,
  categories,
  companyStats,
  contactDetails,
  featuredProducts,
  qualityHighlights,
} from './siteData'

const primaryNavigation = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

const marketFocus = [
  'Retail stores and chilled displays',
  'Restaurants and horeca supply',
  'Direct consumer-ready products',
  'Controlled daily production output',
]

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.replace(/\/+$/, '')
}

function buildCategoryPath(slug) {
  return `/categories/${slug}`
}

function getPageTitle(pathname) {
  if (pathname === '/about') {
    return 'TIAMO | About'
  }

  if (pathname === '/contact') {
    return 'TIAMO | Contact'
  }

  if (pathname.startsWith('/categories/')) {
    const slug = pathname.replace('/categories/', '')
    const category = categories.find((item) => item.slug === slug)
    return category ? `TIAMO | ${category.title}` : 'TIAMO'
  }

  return 'TIAMO | Meat Industry'
}

function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => {
      setPathname(normalizePath(window.location.pathname))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.title = getPageTitle(pathname)
  }, [pathname])

  function navigate(nextPath) {
    const normalizedPath = normalizePath(nextPath)

    if (normalizedPath === pathname) {
      return
    }

    window.history.pushState({}, '', normalizedPath)
    setPathname(normalizedPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let content = <HomePage onNavigate={navigate} />

  if (pathname === '/about') {
    content = <AboutPage onNavigate={navigate} />
  } else if (pathname === '/contact') {
    content = <ContactPage />
  } else if (pathname.startsWith('/categories/')) {
    const slug = pathname.replace('/categories/', '')
    const category = categories.find((item) => item.slug === slug)
    content = category ? (
      <CategoryPage category={category} onNavigate={navigate} />
    ) : (
      <NotFoundPage onNavigate={navigate} />
    )
  }

  return (
    <div className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="site-header">
        <div className="header-topline">
          <span>TIAMO Meat Industry</span>
          <span>Gllumovo - Matka, Skopje</span>
        </div>

        <div className="header-main">
          <RouteLink to="/" onNavigate={navigate} className="brand-lockup">
            <img className="brand-logo" src={tiamoLogo} alt="TIAMO logo" />
            <span className="brand-copy">
              <strong>TIAMO</strong>
              <small>Meat processing and meat products</small>
            </span>
          </RouteLink>

          <nav className="primary-nav" aria-label="Primary">
            {primaryNavigation.map((item) => (
              <RouteLink
                key={item.path}
                to={item.path}
                onNavigate={navigate}
                className={pathname === item.path ? 'is-active' : ''}
              >
                {item.label}
              </RouteLink>
            ))}
          </nav>
        </div>

        <nav className="category-nav" aria-label="Product categories">
          {categories.map((category) => {
            const categoryPath = buildCategoryPath(category.slug)

            return (
              <RouteLink
                key={category.slug}
                to={categoryPath}
                onNavigate={navigate}
                className={pathname === categoryPath ? 'is-active' : ''}
              >
                {category.title}
              </RouteLink>
            )
          })}
        </nav>
      </header>

      <main>{content}</main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <img className="footer-logo" src={tiamoLogo} alt="TIAMO logo" />
            <p>
              TIAMO is presented here as a React-built corporate site with separate pages and
              source-based product categories.
            </p>
          </div>

          <div>
            <h2>Company</h2>
            <div className="footer-links">
              {primaryNavigation.map((item) => (
                <RouteLink key={item.path} to={item.path} onNavigate={navigate}>
                  {item.label}
                </RouteLink>
              ))}
            </div>
          </div>

          <div>
            <h2>Categories</h2>
            <div className="footer-links">
              {categories.slice(0, 4).map((category) => (
                <RouteLink
                  key={category.slug}
                  to={buildCategoryPath(category.slug)}
                  onNavigate={navigate}
                >
                  {category.title}
                </RouteLink>
              ))}
            </div>
          </div>

          <div>
            <h2>Contact</h2>
            <div className="footer-links footer-links-text">
              <span>{contactDetails.address}</span>
              <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              <a href={`tel:${contactDetails.phoneRaw}`}>{contactDetails.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HomePage({ onNavigate }) {
  return (
    <div className="page-content">
      <section className="hero-banner" style={{ backgroundImage: `url(${aboutContent.image})` }}>
        <div className="hero-overlay">
          <div className="hero-panel">
            <p className="eyebrow">North Macedonia meat production</p>
            <h1>Quality meat products for retail, horeca, and everyday supply.</h1>
            <p className="hero-text">
              TIAMO produces beef and chicken products for stores, restaurants, and consumers with
              a broad category range, modern processing, and strong quality control.
            </p>

            <div className="hero-actions">
              <RouteLink to="/about" onNavigate={onNavigate} className="button button-primary">
                About TIAMO
              </RouteLink>
              <RouteLink
                to={buildCategoryPath(categories[0].slug)}
                onNavigate={onNavigate}
                className="button button-secondary"
              >
                Product categories
              </RouteLink>
            </div>
          </div>
        </div>
      </section>

      <section className="overview-section">
        <article className="overview-copy">
          <p className="section-tag">TIAMO overview</p>
          <h2>Food production presented with a cleaner corporate structure.</h2>
          <p>
            The new layout shifts TIAMO away from a generic catalog feel and toward a corporate
            presentation similar in rhythm to large food-group sites: clear overview copy, focused
            metrics, structured category access, and cleaner page separation.
          </p>
          <div className="focus-list">
            {marketFocus.map((item) => (
              <div className="focus-item" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="overview-cards">
          {categories.slice(0, 4).map((category) => (
            <RouteLink
              key={category.slug}
              to={buildCategoryPath(category.slug)}
              onNavigate={onNavigate}
              className="overview-card"
            >
              <img src={category.heroImage} alt={category.title} loading="lazy" />
              <div>
                <strong>{category.title}</strong>
                <span>{String(category.products.length).padStart(2, '0')} products</span>
              </div>
            </RouteLink>
          ))}
        </aside>
      </section>

      <section className="facts-section">
        <div className="section-heading center">
          <p className="section-tag">Facts and figures</p>
          <h2>Core numbers up front, in the style of a company overview rather than a landing page.</h2>
        </div>

        <div className="facts-grid">
          {companyStats.map((item) => (
            <article className="fact-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell muted-shell">
        <div className="section-heading">
          <p className="section-tag">Categories</p>
          <h2>Browse the TIAMO assortment through separate category pages.</h2>
        </div>

        <div className="category-showcase">
          {categories.map((category) => (
            <RouteLink
              key={category.slug}
              to={buildCategoryPath(category.slug)}
              onNavigate={onNavigate}
              className="category-panel"
            >
              <img src={category.heroImage} alt={category.title} loading="lazy" />
              <div className="category-panel__body">
                <span>{String(category.products.length).padStart(2, '0')} items</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
            </RouteLink>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p className="section-tag">Featured products</p>
          <h2>Selected products carried over from the original TIAMO homepage.</h2>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article className="product-card" key={product.slug}>
              <img src={product.image} alt={product.name} loading="lazy" />
              <div className="product-card__body">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell contact-cta">
        <div className="contact-cta__copy">
          <p className="section-tag">Production and quality</p>
          <h2>Quality control, selected raw material, and daily production discipline remain central.</h2>
        </div>
        <div className="quality-list">
          {qualityHighlights.map((item) => (
            <div className="quality-list__item" key={item}>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AboutPage({ onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner" style={{ backgroundImage: `url(${aboutContent.image})` }}>
        <div className="subpage-overlay">
          <div className="subpage-copy">
            <p className="section-tag">About TIAMO</p>
            <h1>{aboutContent.title}</h1>
            <p>{aboutContent.intro}</p>
          </div>
        </div>
      </section>

      <section className="facts-section compact-facts">
        <div className="facts-grid">
          {companyStats.map((item) => (
            <article className="fact-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell two-column-layout">
        <article className="content-card">
          <h2>Company story</h2>
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <aside className="content-card accent-card">
          <h2>Category access</h2>
          <div className="side-links">
            {categories.map((category) => (
              <RouteLink
                key={category.slug}
                to={buildCategoryPath(category.slug)}
                onNavigate={onNavigate}
              >
                {category.title}
              </RouteLink>
            ))}
          </div>
        </aside>
      </secti