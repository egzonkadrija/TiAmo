import { useEffect, useRef, useState } from 'react'
import tiamoLogo from '../assets/tiamo-logo.png'
import {
  aboutContent,
  categories,
  companyStats,
  contactDetails,
  qualityHighlights,
} from './siteData'

const primaryNavigation = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
]

const homeHeroImage = 'https://tiamo.mk/wp-content/uploads/2021/06/1-slider-one_compressed.jpg'
const productionQualityImage = aboutContent.image

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.replace(/\/+$/, '')
}

function buildCategoryPath(slug) {
  return `/categories/${slug}`
}

function buildProductPath(categorySlug, productSlug) {
  return `/categories/${categorySlug}/products/${productSlug}`
}

function findCategoryAndProduct(pathname) {
  const match = pathname.match(/^\/categories\/([^/]+)\/products\/([^/]+)$/)

  if (!match) {
    return null
  }

  const [, categorySlug, productSlug] = match
  const category = categories.find((item) => item.slug === categorySlug)

  if (!category) {
    return null
  }

  const product = category.products.find((item) => item.slug === productSlug)

  if (!product) {
    return null
  }

  return { category, product }
}

function getPageTitle(pathname) {
  if (pathname === '/about') {
    return 'TIAMO | About'
  }

  if (pathname === '/contact') {
    return 'TIAMO | Contact'
  }

  const productMatch = findCategoryAndProduct(pathname)

  if (productMatch) {
    return `TIAMO | ${productMatch.product.name}`
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
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const navProductsRef = useRef(null)

  useEffect(() => {
    const onPopState = () => {
      setPathname(normalizePath(window.location.pathname))
      setIsProductsOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.title = getPageTitle(pathname)
  }, [pathname])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!navProductsRef.current?.contains(event.target)) {
        setIsProductsOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProductsOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  function navigate(nextPath) {
    const normalizedPath = normalizePath(nextPath)

    if (normalizedPath === pathname) {
      return
    }

    window.history.pushState({}, '', normalizedPath)
    setPathname(normalizedPath)
    setIsProductsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let content = <HomePage onNavigate={navigate} />

  if (pathname === '/about') {
    content = <AboutPage onNavigate={navigate} />
  } else if (pathname === '/contact') {
    content = <ContactPage />
  } else if (findCategoryAndProduct(pathname)) {
    const { category, product } = findCategoryAndProduct(pathname)
    content = <ProductPage category={category} product={product} onNavigate={navigate} />
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
        <div className="header-main">
          <RouteLink to="/" onNavigate={navigate} className="brand-lockup">
            <img className="brand-logo" src={tiamoLogo} alt="TIAMO logo" />
          </RouteLink>

          <div className="header-actions">
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

              <div
                ref={navProductsRef}
                className={`nav-products ${pathname.startsWith('/categories/') ? 'is-active' : ''} ${
                  isProductsOpen ? 'is-open' : ''
                }`}
              >
                <button
                  type="button"
                  className="nav-products-trigger"
                  aria-haspopup="true"
                  aria-expanded={isProductsOpen}
                  onClick={() => setIsProductsOpen((current) => !current)}
                >
                  Products
                </button>

                <div className="products-dropdown">
                  <div className="products-dropdown-grid">
                    {categories.map((category) => {
                      const categoryPath = buildCategoryPath(category.slug)

                      return (
                        <RouteLink
                          key={category.slug}
                          to={categoryPath}
                          onNavigate={navigate}
                          className={`products-dropdown-card ${
                            pathname.startsWith(categoryPath) ? 'is-active' : ''
                          }`}
                        >
                          <img
                            className={`products-dropdown-card-image ${
                              category.slug === 'sausages' ? 'products-dropdown-card-image-large' : ''
                            }`}
                            src={category.heroImage}
                            alt={category.title}
                            loading="lazy"
                          />
                          <div className="products-dropdown-card-body">
                            <strong>{category.title}</strong>
                            <span>{category.products.length} products</span>
                          </div>
                        </RouteLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            </nav>

            <RouteLink to="/contact" onNavigate={navigate} className="button button-primary header-cta">
              Contact
            </RouteLink>
          </div>
        </div>
      </header>

      <main>{content}</main>

      <footer className="site-footer">
        <div className="section-inner">
          <div className="footer-grid">
            <div className="footer-brand footer-column">
              <img className="footer-logo" src={tiamoLogo} alt="TIAMO logo" />
              <p>
                Beef and chicken products for retail, horeca, and daily supply with controlled
                production and certified quality standards.
              </p>
            </div>

            <div className="footer-column">
              <h2>Company</h2>
              <div className="footer-links footer-links-plain">
                {primaryNavigation.map((item) => (
                  <RouteLink key={item.path} to={item.path} onNavigate={navigate}>
                    {item.label}
                  </RouteLink>
                ))}
              </div>
            </div>

            <div className="footer-column">
              <h2>Categories</h2>
              <div className="footer-links footer-links-plain">
                {categories.slice(0, 6).map((category) => (
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

            <div className="footer-column">
              <h2>Contact</h2>
              <div className="footer-links footer-links-text footer-links-plain">
                <span>{contactDetails.address}</span>
                <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
                <a href={`tel:${contactDetails.phoneRaw}`}>{contactDetails.phoneDisplay}</a>
              </div>
            </div>

            <div className="footer-column">
              <h2>Quality</h2>
              <div className="footer-links footer-links-text footer-links-plain">
                <span>HACCP certified production</span>
                <span>HALAL certified processes</span>
                <span>Approx. 20 tons per day capacity</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>TIAMO</span>
            <span>Gllumovo - Matka, Skopje</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HomePage({ onNavigate }) {
  return (
    <div className="page-content">
      <section
        className="hero-banner home-hero"
        style={{ backgroundImage: `url(${homeHeroImage})` }}
      >
        <div className="hero-overlay">
          <div className="section-inner hero-layout">
            <div className="hero-panel">
              <p className="section-tag">TIAMO Meat Industry</p>
              <h1>
                <span className="hero-title-line">Beef &amp; poultry.</span>
                <span className="hero-title-line">Refined for</span>
                <span className="hero-title-line">retail &amp; horeca</span>
              </h1>
              <p className="hero-text">
                Certified meat production for retail, horeca, and consumersprecision processing,
                consistent excellence.
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

            <div className="hero-stage hero-stage-static" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="facts-section">
        <div className="section-inner">
          <div className="section-heading center">
            <p className="section-tag">Facts and figures</p>
            <h2>Core numbers up front, in the style of a company overview rather than a landing page.</h2>
          </div>

          <div className="facts-grid">
            {companyStats.map((item) => (
              <article
                className={`fact-card ${item.label === 'Certifications' ? 'fact-card-nowrap' : ''}`}
                key={item.label}
              >
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell muted-shell">
        <div className="section-inner">
          <div className="section-heading center">
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
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </RouteLink>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell contact-cta">
        <div className="section-inner">
          <p className="section-tag contact-cta__title">Production and quality</p>
          <div className="contact-cta__media-block">
          <div
            className="contact-cta__copy"
            style={{ '--contact-cta-image': `url(${productionQualityImage})` }}
          >
            <div className="contact-cta__copy-overlay">
              <h2>Quality control, selected raw material, and daily production discipline remain central.</h2>
            </div>
          </div>
          </div>
          <div className="quality-list">
            {qualityHighlights.map((item) => (
              <div className="quality-list__item" key={item.title}>
                <span>{item.title}</span>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function AboutPage({ onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner about-banner" style={{ backgroundImage: `url(${aboutContent.image})` }}>
        <div className="subpage-overlay">
          <div className="subpage-copy">
            <p className="section-tag">About TIAMO</p>
            <h1>{aboutContent.title}</h1>
            <p>{aboutContent.intro}</p>
          </div>
        </div>
      </section>

      <section className="facts-section compact-facts">
        <div className="section-inner">
          <div className="facts-grid">
            {companyStats.map((item) => (
              <article
                className={`fact-card ${item.label === 'Certifications' ? 'fact-card-nowrap' : ''}`}
                key={item.label}
              >
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell two-column-layout">
        <div className="section-inner">
          <article className="content-card">
            <h2>Company story</h2>
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        </div>
      </section>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="page-content">
      <section className="subpage-banner contact-banner">
        <div className="subpage-overlay">
          <div className="subpage-copy narrow">
            <p className="section-tag">Contact</p>
            <h1>Direct details from the TIAMO contact page.</h1>
            <p>Address, email, phone link, and map route are preserved in a cleaner company format.</p>
          </div>
        </div>
      </section>

      <section className="section-shell contact-grid">
        <div className="section-inner">
          <article className="content-card">
            <h2>Reach TIAMO</h2>
            <div className="detail-list">
              <div className="detail-row">
                <span>Address</span>
                <strong>{contactDetails.address}</strong>
              </div>
              <div className="detail-row">
                <span>Email</span>
                <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <a href={`tel:${contactDetails.phoneRaw}`}>{contactDetails.phoneDisplay}</a>
              </div>
            </div>
          </article>

          <aside className="content-card accent-card">
            <h2>Contact details</h2>
            <p>
              TIAMO serves retail, horeca, and consumer supply from its production base in
              Gllumovo - Matka, Skopje.
            </p>
            <div className="detail-list compact-detail-list">
              <div className="detail-row">
                <span>Certifications</span>
                <strong>HACCP and HALAL</strong>
              </div>
              <div className="detail-row">
                <span>Capacity</span>
                <strong>About 20 tons per day</strong>
              </div>
            </div>
            <a className="button button-primary" href={contactDetails.mapUrl} target="_blank" rel="noreferrer">
              Open Google Maps
            </a>
          </aside>
        </div>
      </section>
    </div>
  )
}

function CategoryPage({ category, onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner category-page-hero">
        <div className="section-inner category-hero-layout">
          <div className="subpage-copy subpage-copy-solid">
            <p className="section-tag">TIAMO category</p>
            <h1>{category.title}</h1>
            <p>{category.description}</p>
          </div>

          <div className="category-hero-media">
            <img src={category.heroImage} alt={category.title} loading="eager" />
          </div>
        </div>
      </section>

      <section className="section-shell category-topline">
        <div className="section-inner">
          <div className="category-topline__summary">
            <h2>{category.products.length} products in this category</h2>
            <p>Images and product names are arranged from the original TIAMO category source.</p>
          </div>

          <div className="side-links compact">
            {categories
              .filter((item) => item.slug !== category.slug)
              .slice(0, 4)
              .map((item) => (
                <RouteLink key={item.slug} to={buildCategoryPath(item.slug)} onNavigate={onNavigate}>
                  {item.title}
                </RouteLink>
              ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-inner">
          <div className="product-grid">
            {category.products.map((product) => (
              <RouteLink
                key={`${category.slug}-${product.slug}`}
                to={buildProductPath(category.slug, product.slug)}
                onNavigate={onNavigate}
                className="product-card"
              >
                <img src={product.image} alt={product.name} loading="lazy" />
                <div className="product-card__body">
                  <span>{category.title}</span>
                  <h3>{product.name}</h3>
                </div>
              </RouteLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductPage({ category, product, onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner category-page-hero product-page-hero">
        <div className="section-inner category-hero-layout">
          <div className="subpage-copy subpage-copy-solid">
            <p className="section-tag">{category.title}</p>
            <h1>{product.name}</h1>
            <p>Open the full product image and return to the category when needed.</p>
          </div>

          <div className="category-hero-media product-hero-media">
            <img src={product.image} alt={product.name} loading="eager" />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-inner product-view">
          <RouteLink to={buildCategoryPath(category.slug)} onNavigate={onNavigate} className="button button-secondary">
            Back to {category.title}
          </RouteLink>

          <a className="product-image-frame" href={product.image} target="_blank" rel="noreferrer">
            <img src={product.image} alt={product.name} loading="eager" />
          </a>
        </div>
      </section>
    </div>
  )
}

function NotFoundPage({ onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner contact-banner">
        <div className="subpage-overlay">
          <div className="subpage-copy narrow">
            <p className="section-tag">Page not found</p>
            <h1>The requested page is not part of the TIAMO structure.</h1>
            <p>Use the navigation to return to the company pages and product categories.</p>
            <RouteLink to="/" onNavigate={onNavigate} className="button button-primary">
              Go home
            </RouteLink>
          </div>
        </div>
      </section>
    </div>
  )
}

function RouteLink({ to, onNavigate, className, children }) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }

        event.preventDefault()
        onNavigate(to)
      }}
    >
      {children}
    </a>
  )
}

export default App
