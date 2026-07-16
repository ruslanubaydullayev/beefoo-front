<template>
  <header class="site-header">
    <div class="page-shell site-header__inner">
      <NuxtLink to="/" class="brand-mark" aria-label="BeeCoo home">
        <span class="brand-mark__glyph" aria-hidden="true" />
        <span>BeeCoo</span>
      </NuxtLink>

      <nav class="nav-links" aria-label="Primary">
        <NuxtLink to="/brands">Brands</NuxtLink>
        <NuxtLink to="/search">Search</NuxtLink>
      </nav>
    </div>
  </header>
</template>