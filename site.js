const trafficMessages = {
    close: {
        title: "process.exit() отменён",
        dot: "close",
        body: `
            <p>Стой, не закрывай так быстро.</p>
            <p>Если хочешь обсудить аналитику, эксперименты, оценку AI или странное поведение систем, Егору можно написать в блоке контактов.</p>
        `,
        primary: "открыть контакты",
        secondary: "ладно, читаю дальше"
    },
    minimize: {
        title: "фоновый режим включён",
        dot: "minimize",
        body: `
            <p>Сайт якобы свёрнут, но процесс всё ещё жив.</p>
            <p>В фоне Егор обычно думает про:</p>
            <ul>
                <li>memory pressure;</li>
                <li>A/B тесты, которые слишком уверенно выглядят;</li>
                <li>метрики, которые показывают что, но не объясняют почему.</li>
            </ul>
            <p>Можно написать ему, пока процесс не уснул.</p>
        `,
        primary: "открыть контакты",
        secondary: "вернуться к чтению"
    },
    maximize: {
        title: "контекст профиля: открыт",
        dot: "maximize",
        body: `
            <p>Если ты HR, PO или TGM и нажал сюда просто проверить кнопку: всё работает.</p>
            <p>На сайте собраны примеры задач Егора: эксперименты, аналитическая инфраструктура и оценка Conversational AI.</p>
        `,
        primary: "открыть контакты",
        secondary: "понятно, продолжаю"
    }
};

let lastFocusedElement = null;

function contactHref() {
    return window.location.pathname.includes("/blog/") ? "../index.html#contacts" : "#contacts";
}

function openContacts() {
    const contacts = document.querySelector("#contacts");
    closeTrafficModal();

    if (contacts) {
        contacts.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    window.location.href = contactHref();
}

function closeTrafficModal() {
    const overlay = document.querySelector(".traffic-overlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function openTrafficModal(kind) {
    const overlay = document.querySelector(".traffic-overlay");
    const message = trafficMessages[kind];

    if (!overlay || !message) {
        return;
    }

    lastFocusedElement = document.activeElement;
    overlay.querySelector(".traffic-dot").className = `traffic-dot ${message.dot}`;
    overlay.querySelector(".traffic-modal-title").textContent = `терминал/${message.title}`;
    overlay.querySelector(".traffic-modal-body h2").textContent = message.title;
    overlay.querySelector(".traffic-modal-copy").innerHTML = message.body;
    overlay.querySelector("[data-traffic-primary]").textContent = message.primary;
    overlay.querySelector("[data-traffic-close]").textContent = message.secondary;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelector("[data-traffic-close]").focus();
}

function createTrafficModal() {
    const overlay = document.createElement("div");
    overlay.className = "traffic-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div class="traffic-modal" role="dialog" aria-modal="true" aria-labelledby="traffic-title">
            <div class="traffic-modal-header">
                <span class="traffic-dot close"></span>
                <span class="traffic-modal-title">терминал/процесс</span>
            </div>
            <div class="traffic-modal-body">
                <h2 id="traffic-title"></h2>
                <div class="traffic-modal-copy"></div>
                <div class="traffic-modal-actions">
                    <button class="traffic-action primary" type="button" data-traffic-primary></button>
                    <button class="traffic-action" type="button" data-traffic-close></button>
                </div>
            </div>
        </div>
    `;

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeTrafficModal();
        }
    });

    overlay.querySelector("[data-traffic-primary]").addEventListener("click", openContacts);
    overlay.querySelector("[data-traffic-close]").addEventListener("click", closeTrafficModal);
    document.body.appendChild(overlay);
}

function setupTrafficButtons() {
    const labels = {
        close: "Показать пасхалку закрытия",
        minimize: "Показать пасхалку сворачивания",
        maximize: "Показать пасхалку разворачивания"
    };

    document.querySelectorAll(".button.close, .button.minimize, .button.maximize").forEach((button) => {
        const kind = ["close", "minimize", "maximize"].find((name) => button.classList.contains(name));

        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", labels[kind]);
        button.addEventListener("click", () => openTrafficModal(kind));
        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTrafficModal(kind);
            }
        });
    });
}

function setupMobileMenu() {
    const menuButton = document.querySelector(".mobile-menu");
    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) {
        return;
    }

    const backdrop = document.createElement("button");
    backdrop.className = "menu-backdrop";
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Закрыть меню");
    document.body.appendChild(backdrop);

    const closeMenu = () => {
        sidebar.classList.remove("is-open");
        backdrop.classList.remove("is-visible");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
        sidebar.classList.add("is-open");
        backdrop.classList.add("is-visible");
        document.body.classList.add("menu-open");
        menuButton.setAttribute("aria-expanded", "true");
    };

    menuButton.addEventListener("click", () => {
        if (sidebar.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    backdrop.addEventListener("click", closeMenu);

    sidebar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
            closeMenu();
            menuButton.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            closeMenu();
        }
    });
}

function setupSectionNavigation() {
    const localLinks = [...document.querySelectorAll('.sidebar-nav a[href^="#"]')];

    if (!localLinks.length || !("IntersectionObserver" in window)) {
        return;
    }

    const linksById = new Map(localLinks.map((link) => [link.getAttribute("href").slice(1), link]));
    const sections = [...linksById.keys()]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
            return;
        }

        localLinks.forEach((link) => link.classList.remove("active"));
        linksById.get(visible.target.id)?.classList.add("active");
    }, {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.2, 0.5]
    });

    sections.forEach((section) => observer.observe(section));
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupBootSequence() {
    if (prefersReducedMotion()) {
        return;
    }

    const targets = [
        document.querySelector(".sidebar"),
        document.querySelector(".toolbar"),
        document.querySelector(".identity, .article-shell"),
        document.querySelector(".status-grid")
    ].filter(Boolean);

    targets.forEach((element, index) => {
        element.classList.add("boot-item");
        element.style.setProperty("--boot-delay", `${index * 70}ms`);
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            targets.forEach((element) => element.classList.add("is-visible"));
        });
    });
}

function setupRevealAnimations() {
    const items = [...document.querySelectorAll(
        ".console-section, .contactbar, .article-section, .article-nav"
    )];

    if (!items.length || prefersReducedMotion()) {
        return;
    }

    items.forEach((item) => item.classList.add("reveal-item"));

    if (!("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
    });

    items.forEach((item) => observer.observe(item));
}

function setupReadingProgress() {
    const article = document.querySelector(".article");
    const toolbar = document.querySelector(".toolbar");

    if (!article || !toolbar) {
        return;
    }

    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    toolbar.appendChild(progress);

    let scheduled = false;

    const updateProgress = () => {
        const articleTop = article.getBoundingClientRect().top + window.scrollY;
        const articleEnd = articleTop + article.offsetHeight - window.innerHeight;
        const distance = Math.max(1, articleEnd - articleTop);
        const value = Math.min(1, Math.max(0, (window.scrollY - articleTop) / distance));
        progress.style.transform = `scaleX(${value})`;
        scheduled = false;
    };

    const scheduleUpdate = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;
        requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateProgress();
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeTrafficModal();
    }
});

createTrafficModal();
setupTrafficButtons();
setupMobileMenu();
setupSectionNavigation();
setupBootSequence();
setupRevealAnimations();
setupReadingProgress();
