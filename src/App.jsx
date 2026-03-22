import { useEffect, useRef, useState } from 'react'
import aboutUsImage from '../assets/homehero_compress.jpg'
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
const PRODUCTS_SECTION_ID = 'products-section'
const factsStats = [
  ...companyStats,
  {
    value: `${categories.length}`,
    label: 'Product categories',
    note: 'Across retail and horeca needs.',
  },
]

function getProductIntro(category, product) {
  return `${product.name} from the TIAMO ${category.title.toLowerCase()} range.`
}

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

  if (pathname === '/products') {
    return 'TIAMO | Products'
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
  } else if (pathname === '/products') {
    content = <ProductsPage onNavigate={navigate} />
  } else if (pathname === '/contact') {
    content = <ContactPage />
  } else if (findCategoryAndProduct(pathname)) {
    const { category, product } = findCategoryAndProduct(pathname)
    content = <ProductPage category={category} product={product} onNavigate={navigate} />
  } else if (pathname.startsWith('/categories/')) {
    const slug = pathname.replace('/categories/', '')
    const category = categories.find((item) => item.slug === slug)
    content = category ? (
      <CategoryPage
        category={category}
        onNavigate={navigate}
        onNavigateToProducts={() => navigate('/products')}
      />
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
                className={`nav-products ${
                  pathname === '/products' || pathname.startsWith('/categories/') ? 'is-active' : ''
                } ${
                  isProductsOpen ? 'is-open' : ''
                }`}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <div className="nav-products-controls">
                  <RouteLink
                    to="/products"
                    onNavigate={navigate}
                    className={`nav-products-link ${
                      pathname === '/products' || pathname.startsWith('/categories/') ? 'is-active' : ''
                    }`}
                  >
                    Products
                  </RouteLink>

                  <button
                    type="button"
                    className="nav-products-trigger"
                    aria-haspopup="true"
                    aria-expanded={isProductsOpen}
                    aria-label="Toggle product categories"
                    onClick={() => setIsProductsOpen((current) => !current)}
                  />
                </div>

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
              <p>Certified beef &amp; poultry. Reliable daily supply.</p>
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
              <h2>Contact</h2>
              <div className="footer-links footer-links-text footer-links-plain">
                <span>{contactDetails.address}</span>
                <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
                <a href={`tel:${contactDetails.phoneRaw}`}>{contactDetails.phoneDisplay}</a>
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
  const sliderRef = useRef(null)
  const [canSlidePrev, setCanSlidePrev] = useState(false)
  const [canSlideNext, setCanSlideNext] = useState(true)

  function getSliderStep(slider) {
    if (!slider) {
      return 0
    }

    const card = slider.querySelector('.category-slider__card')
    const sliderStyles = window.getComputedStyle(slider)
    const gap = Number.parseFloat(sliderStyles.columnGap || sliderStyles.gap || '0')

    return card ? card.getBoundingClientRect().width + gap : slider.clientWidth * 0.5
  }

  useEffect(() => {
    const slider = sliderRef.current

    if (!slider) {
      return
    }

    const updateSliderState = () => {
      const maxScrollLeft = Math.max(0, slider.scrollWidth - slider.clientWidth)
      setCanSlidePrev(slider.scrollLeft > 4)
      setCanSlideNext(slider.scrollLeft < maxScrollLeft - 4)
    }

    updateSliderState()
    slider.addEventListener('scroll', updateSliderState, { passive: true })
    window.addEventListener('resize', updateSliderState)

    return () => {
      slider.removeEventListener('scroll', updateSliderState)
      window.removeEventListener('resize', updateSliderState)
    }
  }, [])

  function handleSlide(direction) {
    const slider = sliderRef.current

    if (!slider) {
      return
    }
    const amount = getSliderStep(slider)

    slider.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

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
                <span className="hero-title-line">Built for retail</span>
                <span className="hero-title-line">&amp; horeca.</span>
              </h1>
              <p className="hero-text">
                Certified production, disciplined processing, and reliable supply from TIAMO.
              </p>
              <div className="hero-actions">
                <RouteLink to="/about" onNavigate={onNavigate} className="button button-primary">
                  Company profile
                </RouteLink>
                <RouteLink
                  to={buildCategoryPath(categories[0].slug)}
                  onNavigate={onNavigate}
                  className="button button-secondary"
                >
                  Browse categories
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
            <h2>Production, capacity, and compliance in one view.</h2>
          </div>

          <div className="facts-grid">
            {factsStats.map((item) => (
              <article className="fact-card" key={item.label}>
                <strong>{item.value}</strong>
                <span className="fact-card__label">{item.label}</span>
                <p className="fact-card__note">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id={PRODUCTS_SECTION_ID} className="section-shell muted-shell">
        <div className="section-inner">
          <div className="section-heading center">
            <p className="section-tag">Categories</p>
            <h2>Built for retail and horeca.</h2>
            <p>Explore beef and poultry lines by category.</p>
          </div>

          <div className="category-slider">
            <div className="category-slider__controls">
              <button
                type="button"
                className="button button-secondary category-slider__button"
                aria-label="Show previous categories"
                disabled={!canSlidePrev}
                onClick={() => handleSlide(-1)}
              >
                &larr;
              </button>
              <button
                type="button"
                className="button button-secondary category-slider__button"
                aria-label="Show next categories"
                disabled={!canSlideNext}
                onClick={() => handleSlide(1)}
              >
                &rarr;
              </button>
            </div>

            <div ref={sliderRef} className="category-slider__track">
              {categories.map((category) => (
                <RouteLink
                  key={category.slug}
                  to={buildCategoryPath(category.slug)}
                  onNavigate={onNavigate}
                  className="category-panel category-slider__card"
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
        </div>
      </section>

      <section className="section-shell contact-cta">
        <div className="section-inner">
          <div className="contact-cta__heading">
            <p className="section-tag contact-cta__title">Production standards</p>
            <h2>Why Choose Us</h2>
          </div>
          <div className="contact-cta__media-block">
          <div
            className="contact-cta__copy"
            style={{ '--contact-cta-image': `url(${productionQualityImage})` }}
          >
          </div>
          </div>
          <div className="quality-list">
            {qualityHighlights.map((item, index) => (
              <div className="quality-list__item" key={item.title}>
                <strong className="quality-list__index">{String(index + 1).padStart(2, '0')}</strong>
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
      <section className="subpage-banner about-banner">
        <div className="subpage-overlay">
          <div className="subpage-copy">
            <p className="section-tag">About TIAMO</p>
            <h1>{aboutContent.title}</h1>
          </div>
        </div>
      </section>

      <section className="facts-section compact-facts">
        <div className="section-inner">
          <div className="facts-grid">
            {factsStats.map((item) => (
              <article className="fact-card" key={item.label}>
                <strong>{item.value}</strong>
                <span className="fact-card__label">{item.label}</span>
                <p className="fact-card__note">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell two-column-layout">
        <div className="section-inner">
          <article className="content-card">
            <h2>Our Story</h2>
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <aside className="about-story-media">
            <img src={aboutUsImage} alt="TIAMO product presentation" loading="lazy" />
          </aside>
        </div>
      </section>
    </div>
  )
}

function ProductsPage({ onNavigate }) {
  return (
    <div className="page-content">
      <section className="subpage-banner category-page-hero">
        <div className="section-inner category-hero-layout">
          <div className="subpage-copy subpage-copy-solid">
            <p className="section-tag">Products</p>
            <h1>Browse TIAMO products.</h1>
            <p>Open any category to explore the full product range.</p>
          </div>

          <div className="category-hero-media">
            <img src={categories[0].heroImage} alt="TIAMO products" loading="eager" />
          </div>
        </div>
      </section>

      <section className="section-shell muted-shell">
        <div className="section-inner">
          <div className="section-heading center">
            <p className="section-tag">Categories</p>
            <h2>Browse products by category.</h2>
            <p>Select a category to view the available products.</p>
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
            <h1>Reach TIAMO directly.</h1>
            <p>Production site, email, phone, and map route in one place.</p>
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
            <h2>Business snapshot</h2>
            <p>Production base in Gllumovo - Matka, Skopje serving retail and horeca clients.</p>
            <div className="detail-list compact-detail-list">
              <div className="detail-row">
                <span>Certifications</span>
                <strong>HACCP and HALAL</strong>
              </div>
              <div className="detail-row">
                <span>Capacity</span>
                <strong>Approx. 20 tons</strong>
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

function CategoryPage({ category, onNavigate, onNavigateToProducts }) {
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
            <p>Browse the category range and open any product for a closer view.</p>
          </div>

          <div className="category-topline__actions">
            <button type="button" className="button button-secondary" onClick={onNavigateToProducts}>
              Back to products
            </button>
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
            <p>{getProductIntro(category, product)}</p>
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
