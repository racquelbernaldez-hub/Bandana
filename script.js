/* =========================================================
   BLOXVERSE - script.js
   - Top games NEW badge + sort
   - Copy button
   - Global search autocomplete
   - Codes dropdown (click + hover)
   - Load More (gamecode.html)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
   A) AUTO NEW (24H) + SORT BY LAST UPDATE
   Works on: any page that has .games-row with .game-card[data-lastupdate]
   ========================= */

function applyAutoNewAndSort(rowEl) {
  const links = Array.from(rowEl.querySelectorAll("a.game-link"));

  const now = Date.now();
  const NEW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  // 1) AUTO NEW badge based on lastupdate within 24hrs
  links.forEach(link => {
    const card = link.querySelector(".game-card");
    if (!card) return;

    const badge = card.querySelector(".game-new-badge");
    const last = new Date(card.getAttribute("data-lastupdate") || 0).getTime();

    const isNew = last && (now - last) <= NEW_WINDOW_MS;

    if (badge) badge.style.display = isNew ? "inline-flex" : "none";
  });

  // 2) SORT by lastupdate (latest first)
  links.sort((a, b) => {
    const ca = a.querySelector(".game-card");
    const cb = b.querySelector(".game-card");
    const da = new Date(ca?.getAttribute("data-lastupdate") || 0).getTime();
    const db = new Date(cb?.getAttribute("data-lastupdate") || 0).getTime();
    return db - da;
  });

  links.forEach(link => rowEl.appendChild(link));
}

// ✅ apply on ALL .games-row (index + gamecode)
document.querySelectorAll(".games-row").forEach(applyAutoNewAndSort);

  /* =========================
     B) COPY BUTTONS
     Works on: game pages with .code-card .copy-btn
     ========================= */
  document.querySelectorAll(".code-card").forEach(card => {
    const btn = card.querySelector(".copy-btn");
    if (!btn) return;

    if (btn.disabled || btn.classList.contains("expired-btn") || card.classList.contains("expired")) return;

    const getCode = () => {
      const dataCode = card.getAttribute("data-code");
      if (dataCode && dataCode.trim()) return dataCode.trim();

      const codeEl = card.querySelector(".code-text");
      if (!codeEl) return "";

      return codeEl.textContent.replace(/\bNEW\b/g, "").trim();
    };

    btn.addEventListener("click", async () => {
      const code = getCode();
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);

        btn.classList.add("copied");
        btn.textContent = "Copied ✓";

        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = "Copy";
        }, 2000);
      } catch (e) {
        btn.textContent = "Failed";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      }
    });
  });

  /* =========================
     C) GLOBAL AUTOCOMPLETE SEARCH
     Works on: index.html + other pages
     Needs: #globalSearch + #searchSuggestions
     ========================= */

  const gamePages = [
    { name: "Nexis Piece", keywords: ["nexis", "nexis piece"], url: "nexis_piece_game.html", img: "Images/noFilter.webp" },
    { name: "Abyss", keywords: ["abyss", "abyys"], url: "abyss_game.html", img: "Images/noFilter (1).webp" },
    { name: "Steal A Brainrot", keywords: ["steal", "brainrot", "steal a brainrot"], url: "steal_a_brainrot.html", img: "Images/StealABrainrot.png" },
    { name: "Catch A Monster", keywords: ["catch", "monster", "catch a monster"], url: "catch_a_monster.html", img: "Images/OBbys.webp" },
    { name: "Lumber Tycoon", keywords: ["lumber", "lumber tycoon", "lumber inc"], url: "lumber_inc.html", img: "Images/lumber.webp" },
    { name: "Ando", keywords: ["ando", "an do"], url: "angkang_game.html", img: "Images/lumber.webp" },
    { name: "Angkang", keywords: ["angkang", "ang kang"], url: "angkang_game.html", img: "Images/lumber.webp" },
    { name: "Star Fishing", keywords: ["star", "star fishing", "fishing"], url: "angkang_game.html", img: "Images/StarFishing.webp" }
  ];

  const globalSearch = document.getElementById("globalSearch");
  const suggestionsBox = document.getElementById("searchSuggestions");

  function hideSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.classList.remove("show");
    suggestionsBox.innerHTML = "";
  }

  function showSuggestions(items) {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = "";

    items.slice(0, 6).forEach(item => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
        <img class="suggestion-thumb" src="${item.img}" alt="${item.name}">
        <div class="suggestion-text">
          <div class="suggestion-title">${item.name}</div>
          <div class="suggestion-sub">Click to open codes</div>
        </div>
        <div class="suggestion-pill">Open</div>
      `;

      div.addEventListener("click", () => {
        window.location.href = item.url;
      });

      suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.add("show");
  }

  function findMatches(query) {
    const q = (query || "").toLowerCase().trim();
    if (!q) return [];

    return gamePages.filter(g => {
      const name = g.name.toLowerCase();
      const nameMatch = name.includes(q) || q.includes(name);

      const keywordMatch = (g.keywords || []).some(k => {
        const kk = k.toLowerCase();
        return kk.includes(q) || q.includes(kk);
      });

      return nameMatch || keywordMatch;
    });
  }

  // expose for onclick="clearGlobalSearch()"
  window.clearGlobalSearch = function clearGlobalSearch() {
    if (!globalSearch) return;
    globalSearch.value = "";
    globalSearch.focus();
    hideSuggestions();
  };

  if (globalSearch && suggestionsBox) {
    globalSearch.addEventListener("input", function () {
      const matches = findMatches(this.value);
      matches.length ? showSuggestions(matches) : hideSuggestions();
    });

    globalSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const matches = findMatches(this.value);
        if (matches.length) window.location.href = matches[0].url;
      }
      if (e.key === "Escape") hideSuggestions();
    });

    document.addEventListener("click", function (e) {
      const shell = globalSearch.closest(".search-shell");
      if (shell && !shell.contains(e.target)) hideSuggestions();
    });
  }

  /* =========================
     D) CODES DROPDOWN (CLICK + HOVER FIXED)
     Needs: #codesDropdown + #codesBtn
     ========================= */

  const dropdown = document.getElementById("codesDropdown");
  const btn = document.getElementById("codesBtn");

  if (dropdown && btn) {
    let pinned = false;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      pinned = !pinned;
      dropdown.classList.toggle("open", pinned);
    });

    dropdown.addEventListener("mouseenter", () => {
      if (!pinned) dropdown.classList.add("open");
    });

    dropdown.addEventListener("mouseleave", () => {
      if (!pinned) dropdown.classList.remove("open");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        pinned = false;
        dropdown.classList.remove("open");
      }
    });
  }

  /* =========================
     E) LOAD MORE (GAMECODE PAGE)
     Needs:
       - <div class="games-row" id="gamesRow"> ...cards... </div>
       - <button id="loadMoreBtn">
     Shows 20 items first, then +20 per click
     ========================= */

  const itemsPerPage = 20;
  const gamesRow = document.getElementById("gamesRow");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (gamesRow && loadMoreBtn) {
    const allItems = Array.from(gamesRow.querySelectorAll("a.game-link"));
    let visibleCount = 0;

    allItems.forEach(el => (el.style.display = "none"));

    function showNextBatch() {
      const nextCount = Math.min(visibleCount + itemsPerPage, allItems.length);

      for (let i = visibleCount; i < nextCount; i++) {
        allItems[i].style.display = "";
      }

      visibleCount = nextCount;

      if (visibleCount >= allItems.length) {
        loadMoreBtn.textContent = "No more games";
        loadMoreBtn.disabled = true;
      } else {
        loadMoreBtn.textContent = `View More (${allItems.length - visibleCount} left)`;
        loadMoreBtn.disabled = false;
      }
    }

    showNextBatch();
    loadMoreBtn.addEventListener("click", showNextBatch);
  }

});