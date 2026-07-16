export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const data = event.context.jsonLd
    if (!data) return

    const payload = JSON.stringify(data).replace(/</g, '\\u003c')
    html.bodyAppend.push(`<script type="application/ld+json">${payload}</script>`)
  })
})
