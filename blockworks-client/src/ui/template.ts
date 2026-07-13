export const template = `
<main id="viewport" aria-label="Blockworks game viewport"></main>

<section id="title" class="screen active">
  <div class="title-panel">
    <h1>BLOCK<span>WORKS</span></h1>
    <p>Run the quarry. Restore the signal tower.</p>
    <div class="menu">
      <button id="continue">Continue</button>
      <button id="new-world" class="primary">New World</button>
      <button data-open="settings">Settings</button>
      <button data-open="controls">Controls</button>
      <button id="delete-world" hidden>Delete World</button>
      <a href="/experimental">Exit</a>
    </div>
    <small>Single-player · Saves in this browser</small>
  </div>
</section>

<section id="new-dialog" class="screen">
  <form class="panel modal">
    <h2>New World</h2>
    <label>World name<input id="world-name" value="Worksite" maxlength="32"></label>
    <label>Seed<input id="world-seed" placeholder="Leave blank for default"></label>
    <div class="row"><button type="button" data-close>Cancel</button><button type="submit" class="primary">Create</button></div>
  </form>
</section>

<section id="settings" class="screen">
  <div class="panel modal">
    <h2>Settings</h2>
    <label>Render distance <output id="render-out"></output><input id="render-distance" type="range" min="3" max="8"></label>
    <label>Field of view <output id="fov-out"></output><input id="fov" type="range" min="60" max="95"></label>
    <label>Mouse sensitivity<input id="sensitivity" type="range" min="1" max="5" step=".1"></label>
    <label>Volume<input id="volume" type="range" min="0" max="1" step=".05"></label>
    <label class="check"><input id="head-bob" type="checkbox"> Head bob</label>
    <label class="check"><input id="objectives" type="checkbox"> Show repair steps</label>
    <button data-close>Done</button>
  </div>
</section>

<section id="controls" class="screen">
  <div class="panel modal">
    <h2>Controls</h2>
    <dl><dt>Move</dt><dd>W A S D</dd><dt>Look</dt><dd>Mouse</dd><dt>Jump</dt><dd>Space</dd><dt>Sprint</dt><dd>Shift</dd><dt>Mine</dt><dd>Left mouse</dd><dt>Place / repair</dt><dd>Right mouse</dd><dt>Inventory</dt><dd>E</dd><dt>Hotbar</dt><dd>1–9 / wheel</dd><dt>Debug</dt><dd>F3</dd><dt>Save</dt><dd>F5</dd></dl>
    <button data-close>Done</button>
  </div>
</section>

<section id="pause" class="screen">
  <div class="panel modal">
    <h2>Paused</h2>
    <div class="menu"><button id="resume" class="primary">Continue</button><button id="save">Save</button><button data-open="settings">Settings</button><button id="quit">Save & Exit</button></div>
  </div>
</section>

<section id="completion" class="screen">
  <div class="panel modal completion-panel">
    <small>SIGNAL RESTORED</small>
    <h2>Run complete</h2>
    <p>The worksite beacon is live. You brought the signal back online.</p>
    <button id="explore" class="primary">Keep exploring</button>
    <button id="complete-quit">Save &amp; Exit</button>
  </div>
</section>

<section id="inventory" class="screen">
  <div class="panel inventory-panel">
    <header><h2>Inventory</h2><button data-close>Close</button></header>
    <div class="inventory-layout"><div><h3>Pack</h3><div id="inventory-grid" class="slots"></div></div><div><h3>Craft</h3><div id="recipes"></div></div></div>
  </div>
</section>

<div id="hud" hidden>
  <div id="objective"><small id="objective-label">EXTRACTION RUN</small><b id="objective-text"></b></div>
  <div id="health"></div>
  <div id="crosshair"></div>
  <div id="mine-progress"><i></i></div>
  <div id="viewmodel" aria-hidden="true"></div>
  <div id="hotbar" class="slots"></div>
  <div id="message"></div>
  <div id="debug" hidden></div>
</div>
<div id="damage"></div>`;
