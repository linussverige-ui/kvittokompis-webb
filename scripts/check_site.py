"""Safety and link contracts for the standalone public marketing site.

Run: python scripts/check_site.py
No network, credentials, production data or external packages required.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

SITE = Path(__file__).resolve().parents[1]
APP_TEST_URL = "https://kvittokompis-test-2q67.onrender.com/login"


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = set()
        self.links = []
        self.images = []
        self.styles = []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            assert attrs["id"] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "img":
            self.images.append((attrs.get("src", ""), attrs))
        if tag == "link":
            self.styles.append(attrs.get("href", ""))


def verify():
    page = (SITE / "index.html").read_text(encoding="utf-8")
    css = (SITE / "landing.css").read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(page)
    assert '<html lang="sv">' in page
    assert parser.h1 == 1
    assert "innehall" in parser.ids
    assert "installera" in parser.ids
    assert "redovisare" in parser.ids, "Missing accountant/PDF section"
    assert 'href="#redovisare"' in page, "Missing PDF navigation"
    assert "kvittobilagor" in page.lower(), "Missing receipt attachments"
    assert "Excel" in page and "PDF" in page
    assert "Direktdelning inifrån appen är inte verifierad" in page, "No unverified in-app sending claim"
    assert "Illustration – inte ett faktiskt exporterat dokument" in page
    assert "Hantverkare" in page
    assert "Frisör &amp; salong" in page or "Frisör & salong" in page
    assert "Frilansare" in page
    assert "Förhandsvisning" in page or "Förhandsversion" in page
    assert "Använd endast påhittade testuppgifter" in page
    assert "inte verifierad" in page
    assert "APK" in page
    assert "noindex, nofollow" in page
    assert not any(tag in ("iframe", "form") for tag, _ in parser.tags)
    scripts = [attrs for tag, attrs in parser.tags if tag == "script"]
    assert len(scripts) == 1 and scripts[0].get("src") == "./navigation.js" and "defer" in scripts[0], "Only vetted first-party navigation script allowed"
    js = (SITE / "navigation.js").read_text(encoding="utf-8")
    assert "querySelector('.landing-mobile-nav')" in js and "menu.open = false" in js
    assert not any(token in js for token in ("fetch(", "XMLHttpRequest", "localStorage", "sendBeacon", "eval(")), "Navigation must remain local/privacy-first"
    assert page.count('class="landing-feature"') == 4, "Expected compact feature grid"
    assert page.count('class="landing-industry ') == 2, "Expected two focused industry cards"
    assert page.count('class="landing-install-card"') == 2, "Expected collapsible installation guides"
    assert "{%" not in page and "{{" not in page
    assert "<!-- private" not in page.lower()
    for href in parser.links:
        assert href, "Empty link"
        if href.startswith("#"):
            assert href[1:] in parser.ids, f"Broken anchor: {href}"
        elif href == "./":
            assert (SITE / "index.html").is_file(), "Missing home page"
        elif href.startswith("./"):
            assert (SITE / href[2:]).is_file(), f"Missing local page: {href}"
        else:
            assert href == APP_TEST_URL, f"Unexpected link leaving website: {href}"
    for src, attrs in parser.images:
        assert src.startswith("./"), f"Remote image: {src}"
        assert (SITE / src[2:]).is_file(), f"Missing image: {src}"
        assert "alt" in attrs, f"Missing alt attribute on image: {src}"
    assert "./landing.css" in parser.styles
    for src in parser.styles:
        if src.startswith("./"):
            assert (SITE / src[2:]).is_file(), f"Missing stylesheet: {src}"
    assert css.count("{") == css.count("}"), "Unbalanced CSS"
    for value in ("#0B2D4F", "#16A766", "#F97316"):
        assert value.lower() in (page + css + (SITE / "assets/kvitto-kompis.svg").read_text(encoding="utf-8")).lower(), f"Missing selected brand color {value}"
    for filename in ("kvitto-kompis.svg", "hantverkare.svg"):
        ET.parse(SITE / "assets" / filename)
    assert (SITE / ".nojekyll").is_file()
    assert not any(SITE.rglob("*.db")), "No database files in Pages artifact"
    print(f"PASS: {len(parser.ids)} unique IDs, {len(parser.links)} working link targets, {len(parser.images)} local images, SVG/CSS, launch safety.")


if __name__ == "__main__":
    try:
        verify()
    except (AssertionError, OSError, ET.ParseError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        sys.exit(1)
