/** True when the logo is a monochrome Simple Icons SVG we can safely tint. */
export function isTintableLogo(imageUrl: string) {
  return /simple-icons\/icons\/[a-z0-9]+\.svg|cdn\.simpleicons\.org\//i.test(imageUrl)
}

/** Kept for compatibility — prefer CSS mask tinting via BrandLogoMark. */
export function coloredLogoUrl(imageUrl: string, _hex?: string | null) {
  return imageUrl
}
