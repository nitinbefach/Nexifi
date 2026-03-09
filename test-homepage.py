from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop screenshot (1280x800)
    desktop = browser.new_page(viewport={"width": 1280, "height": 800})
    desktop.goto("http://localhost:3000", wait_until="networkidle")
    desktop.wait_for_timeout(1000)
    desktop.screenshot(path="/tmp/homepage-desktop.png", full_page=True)
    print("Desktop screenshot saved")
    desktop.close()

    # Mobile screenshot (375x812)
    mobile = browser.new_page(viewport={"width": 375, "height": 812})
    mobile.goto("http://localhost:3000", wait_until="networkidle")
    mobile.wait_for_timeout(1000)
    mobile.screenshot(path="/tmp/homepage-mobile.png", full_page=True)
    print("Mobile screenshot saved")
    mobile.close()

    browser.close()
