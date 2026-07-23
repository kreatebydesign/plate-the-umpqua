import React from 'react'

export default function BeforeLogin() {
  return (
    <>
      <aside className="ptu-login-story" aria-label="Plate The Umpqua">
        <p className="ptu-login-story__brand">PLATE THE UMPQUA</p>
        <p className="ptu-login-story__eyebrow">
          Private Chef & Hospitality Concierge
        </p>
        <span className="ptu-login-story__rule" aria-hidden="true" />
        <p className="ptu-login-story__note">Plate The Umpqua OS</p>
      </aside>

      <header className="ptu-login-intro">
        <h1 className="ptu-login-intro__title">Welcome back</h1>
        <p className="ptu-login-intro__copy">
          Sign in to manage Plate The Umpqua operations, inquiries, events, and
          client relationships.
        </p>
      </header>
    </>
  )
}
