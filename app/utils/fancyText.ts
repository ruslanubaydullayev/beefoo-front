/**
 * Unicode fancy-text transforms (Fontastic-style).
 * Maps A–Z / a–z / 0–9 into Mathematical Alphanumeric Symbols and related sets.
 */

export type FancyStyle = {
  id: string
  name: string
  transform: (input: string) => string
}

function mapChars(
  input: string,
  map: (char: string, code: number) => string | null,
): string {
  let out = ''
  for (const char of input) {
    const code = char.codePointAt(0) ?? 0
    out += map(char, code) ?? char
  }
  return out
}

function offsetMap(
  upperStart: number,
  lowerStart: number | null,
  digitStart: number | null = null,
) {
  return (input: string) =>
    mapChars(input, (char, code) => {
      if (code >= 65 && code <= 90) return String.fromCodePoint(upperStart + (code - 65))
      if (lowerStart != null && code >= 97 && code <= 122) {
        return String.fromCodePoint(lowerStart + (code - 97))
      }
      if (digitStart != null && code >= 48 && code <= 57) {
        return String.fromCodePoint(digitStart + (code - 48))
      }
      return null
    })
}

/** Script has gaps for some lowercase letters — fill from a small override table. */
const SCRIPT_LOWER_GAPS: Record<string, string> = {
  e: 'ℯ',
  g: 'ℊ',
  o: 'ℴ',
}

function scriptTransform(input: string, bold = false) {
  const upper = bold ? 0x1D4D0 : 0x1D49C
  const lower = bold ? 0x1D4EA : 0x1D4B6
  return mapChars(input, (char, code) => {
    if (code >= 65 && code <= 90) {
      // Script capitals: gaps at some letters in regular script
      if (!bold) {
        const gaps: Record<number, string> = {
          66: 'ℬ', // B
          69: 'ℰ', // E
          70: 'ℱ', // F
          72: 'ℋ', // H
          73: 'ℐ', // I
          76: 'ℒ', // L
          77: 'ℳ', // M
          82: 'ℛ', // R
        }
        if (gaps[code]) return gaps[code]!
      }
      return String.fromCodePoint(upper + (code - 65))
    }
    if (code >= 97 && code <= 122) {
      if (!bold && SCRIPT_LOWER_GAPS[char]) return SCRIPT_LOWER_GAPS[char]!
      return String.fromCodePoint(lower + (code - 97))
    }
    return null
  })
}

function frakturTransform(input: string, bold = false) {
  const upper = bold ? 0x1D56C : 0x1D504
  const lower = bold ? 0x1D586 : 0x1D51E
  return mapChars(input, (char, code) => {
    if (code >= 65 && code <= 90) {
      if (!bold) {
        const gaps: Record<number, string> = {
          67: 'ℭ', // C
          72: 'ℌ', // H
          73: 'ℑ', // I
          82: 'ℜ', // R
          90: 'ℨ', // Z
        }
        if (gaps[code]) return gaps[code]!
      }
      return String.fromCodePoint(upper + (code - 65))
    }
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(lower + (code - 97))
    }
    return null
  })
}

function doubleStruckTransform(input: string) {
  return mapChars(input, (char, code) => {
    if (code >= 65 && code <= 90) {
      const gaps: Record<number, string> = {
        67: 'ℂ',
        72: 'ℍ',
        78: 'ℕ',
        80: 'ℙ',
        81: 'ℚ',
        82: 'ℝ',
        90: 'ℤ',
      }
      if (gaps[code]) return gaps[code]!
      return String.fromCodePoint(0x1D538 + (code - 65))
    }
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(0x1D552 + (code - 97))
    }
    if (code >= 48 && code <= 57) {
      return String.fromCodePoint(0x1D7D8 + (code - 48))
    }
    return null
  })
}

const CIRCLED_UPPER = 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ'
const CIRCLED_LOWER = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'
const CIRCLED_DIGIT = '⓪①②③④⑤⑥⑦⑧⑨'

const SMALL_CAPS: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
}

const TINY: Record<string, string> = {
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ',
  j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', q: 'q', r: 'ʳ',
  s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
  A: 'ᴬ', B: 'ᴮ', C: 'ᶜ', D: 'ᴰ', E: 'ᴱ', F: 'ᶠ', G: 'ᴳ', H: 'ᴴ', I: 'ᴵ',
  J: 'ᴶ', K: 'ᴷ', L: 'ᴸ', M: 'ᴹ', N: 'ᴺ', O: 'ᴼ', P: 'ᴾ', Q: 'Q', R: 'ᴿ',
  S: 'ˢ', T: 'ᵀ', U: 'ᵁ', V: 'ⱽ', W: 'ᵂ', X: 'ˣ', Y: 'ʸ', Z: 'ᶻ',
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

const SUBSCRIPT: Record<string, string> = {
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ',
  n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
}

const UPSIDE_DOWN: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: '◖', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
  J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ',
  '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾',
}

const GREEKISH: Record<string, string> = {
  A: 'Α', B: 'Β', C: 'Ϲ', D: 'Ⅾ', E: 'Ε', F: 'Ϝ', G: 'Ԍ', H: 'Η', I: 'Ι',
  J: 'Ј', K: 'Κ', L: 'Ⅼ', M: 'Μ', N: 'Ν', O: 'Ο', P: 'Ρ', Q: 'Ԛ', R: 'Ɍ',
  S: 'Ѕ', T: 'Τ', U: 'Ս', V: 'Ѵ', W: 'Ԝ', X: 'Χ', Y: 'Υ', Z: 'Ζ',
  a: 'α', b: 'в', c: 'ϲ', d: 'ԁ', e: 'ε', f: 'ғ', g: 'ɢ', h: 'һ', i: 'ι',
  j: 'ϳ', k: 'κ', l: 'ӏ', m: 'м', n: 'η', o: 'ο', p: 'ρ', q: 'ԛ', r: 'ʀ',
  s: 'ѕ', t: 'τ', u: 'υ', v: 'ν', w: 'ω', x: 'χ', y: 'γ', z: 'ᴢ',
}

const CURRENCYISH: Record<string, string> = {
  a: '₳', b: '฿', c: '₵', d: '₫', e: 'Ɇ', f: '₣', g: '₲', h: 'Ⱨ', i: 'ł',
  j: 'J', k: '₭', l: '₤', m: '₥', n: '₦', o: 'Ø', p: '₱', q: 'Q', r: 'Ɍ',
  s: '$', t: '₮', u: 'Ʉ', v: 'V', w: '₩', x: 'Ӿ', y: 'Ɏ', z: 'Ƶ',
  A: '₳', B: '฿', C: '₵', D: '₫', E: 'Ɇ', F: '₣', G: '₲', H: 'Ⱨ', I: 'ł',
  J: 'J', K: '₭', L: '₤', M: '₥', N: '₦', O: 'Ø', P: '₱', Q: 'Q', R: 'Ɍ',
  S: '$', T: '₮', U: 'Ʉ', V: 'V', W: '₩', X: 'Ӿ', Y: 'Ɏ', Z: 'Ƶ',
}

function fromTable(table: Record<string, string>, reverse = false) {
  return (input: string) => {
    const mapped = [...input].map((ch) => table[ch] ?? table[ch.toLowerCase()] ?? ch).join('')
    return reverse ? [...mapped].reverse().join('') : mapped
  }
}

function combining(marks: string[]) {
  return (input: string) =>
    [...input]
      .map((ch, index) => {
        if (/\s/.test(ch)) return ch
        return ch + marks[index % marks.length]!
      })
      .join('')
}

function joining(separator: string) {
  return (input: string) => [...input].join(separator)
}

function wrap(left: string, right: string) {
  return (input: string) =>
    [...input]
      .map((ch) => (/\s/.test(ch) ? ch : `${left}${ch}${right}`))
      .join('')
}

export const FANCY_STYLES: FancyStyle[] = [
  { id: 'bold', name: 'Bold', transform: offsetMap(0x1D400, 0x1D41A, 0x1D7CE) },
  { id: 'bold-italic', name: 'Bold Italic', transform: offsetMap(0x1D468, 0x1D482) },
  { id: 'script', name: 'Cursive', transform: (t) => scriptTransform(t, false) },
  { id: 'bold-script', name: 'Script', transform: (t) => scriptTransform(t, true) },
  { id: 'fraktur', name: 'Gothic', transform: (t) => frakturTransform(t, false) },
  { id: 'bold-fraktur', name: 'Gothic Bold', transform: (t) => frakturTransform(t, true) },
  { id: 'double-struck', name: 'Double-Struck', transform: doubleStruckTransform },
  { id: 'sans', name: 'Sans-Serif', transform: offsetMap(0x1D5A0, 0x1D5BA, 0x1D7E2) },
  { id: 'sans-bold', name: 'Sans-Serif Bold', transform: offsetMap(0x1D5D4, 0x1D5EE, 0x1D7EC) },
  { id: 'sans-italic', name: 'Sans-Serif Italic', transform: offsetMap(0x1D608, 0x1D622) },
  { id: 'sans-bold-italic', name: 'Sans Bold Italic', transform: offsetMap(0x1D63C, 0x1D656) },
  { id: 'monospace', name: 'Monospace', transform: offsetMap(0x1D670, 0x1D68A, 0x1D7F6) },
  {
    id: 'fullwidth',
    name: 'Fullwidth',
    transform: (input) =>
      mapChars(input, (char, code) => {
        if (code === 32) return '\u3000'
        if (code >= 33 && code <= 126) return String.fromCodePoint(code + 0xFEE0)
        return null
      }),
  },
  {
    id: 'circled',
    name: 'Yearbook',
    transform: (input) =>
      mapChars(input, (char, code) => {
        if (code >= 65 && code <= 90) return CIRCLED_UPPER[code - 65]!
        if (code >= 97 && code <= 122) return CIRCLED_LOWER[code - 97]!
        if (code >= 48 && code <= 57) return CIRCLED_DIGIT[code - 48]!
        return null
      }),
  },
  {
    id: 'small-caps',
    name: 'Small Caps',
    transform: (input) =>
      mapChars(input, (char) => SMALL_CAPS[char.toLowerCase()] ?? null),
  },
  { id: 'tiny', name: 'Tiny / Superscript', transform: fromTable(TINY) },
  { id: 'subscript', name: 'Subscript', transform: fromTable(SUBSCRIPT) },
  { id: 'upside-down', name: 'Upside Down', transform: fromTable(UPSIDE_DOWN, true) },
  { id: 'greekish', name: 'Greekish', transform: fromTable(GREEKISH) },
  { id: 'currency', name: 'Currency', transform: fromTable(CURRENCYISH) },
  { id: 'slash', name: 'Slash Through', transform: combining(['̸']) },
  { id: 'strike', name: 'Strikethrough', transform: combining(['̶']) },
  { id: 'underline', name: 'Underline', transform: combining(['̲']) },
  { id: 'double-underline', name: 'Double Underline', transform: combining(['̳']) },
  { id: 'dots', name: 'Dotted', transform: combining(['̣']) },
  { id: 'tilde', name: 'Tilde Overlay', transform: combining(['̴']) },
  { id: 'arrow', name: 'Arrow Below', transform: combining(['͎']) },
  { id: 'scared', name: 'Glitchy', transform: combining(['̷', '̸', '̶', '̴', '̵']) },
  { id: 'sparkle', name: 'Sparkles', transform: wrap('✧', '✧') },
  { id: 'brackets', name: 'Brackets', transform: wrap('【', '】') },
  { id: 'wavy', name: 'Wavy', transform: joining('̷') },
  {
    id: 'mirror',
    name: 'Mirrored',
    transform: (input) => input + ' ' + [...input].reverse().join(''),
  },
  {
    id: 'leet',
    name: 'Leet',
    transform: (input) =>
      input
        .replace(/a/gi, '4')
        .replace(/e/gi, '3')
        .replace(/i/gi, '1')
        .replace(/o/gi, '0')
        .replace(/s/gi, '5')
        .replace(/t/gi, '7')
        .replace(/b/gi, '8')
        .replace(/g/gi, '9'),
  },
  {
    id: 'zalgo-lite',
    name: 'Zalgo Lite',
    transform: combining(['̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈́', '͊', '͋', '͌', '̃', '̂', '̌', '͐', '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽', '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ', 'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛', '͆', '̚']),
  },
]

export function transformAll(input: string): Array<{ style: FancyStyle, output: string }> {
  const text = input.length ? input : 'BeeFoo'
  return FANCY_STYLES.map((style) => ({
    style,
    output: style.transform(text),
  }))
}
