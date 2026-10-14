import { css } from 'lit';
export const cardStyles = css`
  :host {
    display:block; container-type:inline-size;
    color:var(--primary-text-color,#263d36);
    font-family:var(--paper-font-body1_-_font-family,inherit);
    --room-muted:var(--secondary-text-color,#69766e);
    --room-line:var(--ha-card-border-color,var(--divider-color,#e2e5dc));
    --room-bg:var(--ha-card-background,var(--card-background-color,#fff));
    --room-soft:color-mix(in srgb,var(--primary-text-color,#263d36) 5%,var(--room-bg));
    --room-green:var(--state-switch-active-color,var(--success-color,#397750));
    --room-amber:var(--state-light-active-color,var(--warning-color,#a35426));
    --room-heat:var(--room-heating-color,var(--red-color,#c94b4b));
  }
  *{box-sizing:border-box}
  ha-card{display:block;background:var(--room-bg);border:1px solid var(--room-line);border-radius:var(--ha-card-border-radius,18px);box-shadow:var(--ha-card-box-shadow,none);padding:20px}
  h2,h3,p{margin:0}
  button,input,summary{font:inherit}
  button{color:inherit;cursor:pointer;min-height:44px;border:0;background:transparent;border-radius:8px;font-size:14px}
  button:disabled{cursor:default;opacity:.45}
  button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color,#2196f3);outline-offset:3px}
  ha-icon{--mdc-icon-size:20px;display:inline-flex;flex-shrink:0}
  .header{display:flex;align-items:center;gap:12px}
  .title{flex:1;min-width:0}
  .title button{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:600;padding:0;text-align:left;overflow-wrap:anywhere;line-height:1.3}
  .subtitle{font-size:13px;color:var(--room-muted);margin-bottom:6px}
  .humidity{display:flex;align-items:center;gap:4px;color:var(--room-muted);font-size:13px;white-space:nowrap}
  .humidity ha-icon{--mdc-icon-size:16px}
  .presence{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--room-muted);line-height:1.5;margin-bottom:12px}
  .presence-dot{width:6px;height:6px;flex-shrink:0;border-radius:50%;background:var(--room-muted)}
  .presence.on .presence-dot{background:var(--room-green)}
  .thermostat{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;margin:12px 0 16px;border:1px solid var(--room-line);border-radius:12px;background:var(--room-soft)}
  .thermostat.heating{background:color-mix(in srgb,var(--room-heat) 8%,var(--room-bg));border-color:color-mix(in srgb,var(--room-heat) 20%,var(--room-line))}
  .thermostat.off .current,.thermostat.off .target-center{color:var(--room-muted)}
  .thermostat.unavailable{border-style:dashed}
  .thermostat.sensor-only{padding:0;border:0;background:none}
  .temperature-reading{min-width:0}
  .current{font-size:36px;letter-spacing:-1px;font-weight:500;white-space:nowrap;line-height:1.15}
  .unit{font-size:14px;color:var(--room-muted);margin-left:3px;letter-spacing:0}
  .hvac{display:flex;align-items:center;gap:4px;font-size:12px;margin-top:4px;line-height:1.4;overflow-wrap:anywhere;text-transform:capitalize}
  .hvac ha-icon{--mdc-icon-size:14px}
  .hvac.heating ha-icon{color:var(--room-heat)}
  .target{display:flex;align-items:center;flex-shrink:0;border-radius:10px;background:var(--room-bg)}
  .target button{min-width:44px;padding:0;font-size:22px;min-height:52px}
  .target-center{text-align:center;min-width:46px;font-size:19px;font-weight:600}
  .target-center small{display:block;font-size:12px;font-weight:400;color:var(--room-muted);margin-bottom:2px}
  .target-readonly{font-size:13px;max-width:140px;text-align:right;overflow-wrap:anywhere}
  .group{min-width:0}
  .group-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;min-height:32px;color:var(--room-muted);margin-bottom:4px}
  .all-off{padding:0;font-size:12px}
  .all-off>span{display:inline-flex;align-items:center;min-height:28px;padding:0 9px;border:1px solid var(--room-line);border-radius:6px}
  .all-off:hover:not(:disabled)>span{border-color:var(--primary-color,#2196f3)}
  .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(58px,1fr));gap:6px}
  .lights-group .tiles{grid-template-columns:repeat(var(--room-light-count,1),minmax(0,1fr))}
  .lights-group .tile>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tile{display:flex;min-width:44px;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:68px;padding:8px 1px;border:1px solid transparent;border-radius:9px;background:var(--room-soft);color:var(--room-muted);position:relative}
  .tile>span{font-size:14px;line-height:1.25;text-align:center;overflow-wrap:anywhere;max-width:100%}
  .tile.active{color:var(--primary-text-color,#263d36);background:color-mix(in srgb,var(--room-green) 10%,var(--room-bg));border-color:color-mix(in srgb,var(--room-green) 25%,var(--room-line))}
  .tile.active ha-icon{color:var(--room-green)}
  .tile.light.active{background:color-mix(in srgb,var(--room-amber) 12%,var(--room-bg));border-color:color-mix(in srgb,var(--room-amber) 25%,var(--room-line))}
  .tile.light.active ha-icon{color:var(--room-amber);filter:drop-shadow(0 0 3px color-mix(in srgb,var(--room-amber) 20%,transparent))}
  .tile.unavailable{border:1px dashed var(--room-muted);opacity:.7}
  .tile.unavailable:after{content:'!';position:absolute;right:4px;top:2px;font-size:12px;font-weight:700}
  .tile:hover:not(:disabled){border-color:var(--room-muted)}
  .secondary{display:grid;gap:12px;margin-top:12px}
  .secondary .tiles{grid-template-columns:repeat(auto-fit,minmax(100px,1fr))}
  .secondary .tile{flex-direction:row;min-height:44px;padding:8px;gap:8px}
  .scenes-group .tile{background:transparent;border:1px solid var(--room-line);color:inherit}
  .scenes-group .tile.active{background:var(--room-soft)}
  .room-footer{display:flex;align-items:center;gap:8px;margin-top:12px;border-top:1px solid var(--room-line);padding-top:4px}.contacts{display:flex;flex:1;min-width:0;flex-wrap:wrap;gap:0 12px}
  .contact{display:flex;align-items:center;gap:6px;min-height:44px;max-width:100%;padding:4px 0;text-align:left;font-size:12px;line-height:1.5;color:var(--room-muted)}
  .contact ha-icon{--mdc-icon-size:16px}
  .contact.open{color:var(--primary-text-color,#263d36)}
  .contact.open ha-icon{color:var(--room-amber)}
  .contact time{white-space:nowrap;font-variant-numeric:tabular-nums}
  .details-link{display:flex;align-items:center;gap:6px;flex-shrink:0;min-width:44px;padding:0;margin-left:auto;color:var(--room-muted)}
  .details-link>span,.history>span{font-size:24px}
  .labels-off .tile>span{display:none}
  .compact{padding:12px}
  .compact .presence{margin-bottom:8px}
  .compact .thermostat{padding:10px;margin:8px 0}
  .compact .tile{min-height:60px;padding:6px 1px}
  .compact .tile>span{font-size:13px}
  .compact .secondary .tile{min-height:44px}
  .compact .room-footer{margin-top:10px}
  .message{display:flex;align-items:center;gap:8px;font-size:13px;line-height:1.5;margin-top:8px;overflow-wrap:anywhere}
  .message:empty{display:none}
  .message.error{color:var(--error-color,#b3261e)}
  .message.status{color:var(--room-muted)}
  .message button{margin-left:auto;min-width:44px;font-size:20px}
  .empty{color:var(--room-muted);font-size:14px;line-height:1.6;padding:12px 0}
  dialog{width:min(480px,calc(100vw - 24px));max-height:calc(100dvh - 24px);border:1px solid var(--room-line);border-radius:18px;background:var(--room-bg);color:inherit;padding:0 20px 20px;box-shadow:0 20px 80px #0003}
  dialog::backdrop{background:#0007}
  dialog header{position:sticky;top:0;z-index:1;background:var(--room-bg);display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 0 8px;border-bottom:1px solid var(--room-line)}
  dialog h2{font-size:20px;overflow-wrap:anywhere}
  dialog .close{min-width:44px;font-size:26px}
  .detail-presence{font-size:13px;color:var(--room-muted);margin-top:12px;line-height:1.5}
  .detail-presence>span{display:block}
  .detail-group{margin-top:20px}
  .detail-group h3{font-size:14px;margin-bottom:8px}
  .detail-control{border-bottom:1px solid var(--room-line);padding:6px 0}
  .detail-row{display:flex;align-items:center;gap:8px;min-height:48px}
  .detail-row .tile{flex:1;flex-direction:row;justify-content:flex-start;min-height:44px;padding:10px;gap:10px}
  .detail-row .tile>span{display:inline;font-size:14px;text-align:left}
  .detail-row .tile[aria-pressed]::after{content:'Off';position:static;margin-left:auto;font-size:12px;color:var(--room-muted)}
  .detail-row .tile[aria-pressed=true]::after{content:'On';color:var(--primary-text-color,#263d36)}
  .detail-row .tile.unavailable::after{content:'!';position:static;margin-left:auto}
  .scenes-details .tile{background:transparent;border:1px solid var(--room-line);color:inherit}
  .info-button{min-width:44px;padding:0;color:var(--room-muted)}
  .light-settings summary{min-height:44px;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:var(--room-muted);cursor:pointer;padding:0 10px;gap:8px}
  .light-settings summary::before{content:'›';font-size:20px}
  .light-settings[open] summary::before{transform:rotate(90deg)}
  .light-settings summary>span{margin-left:auto}
  .dimmer{display:block;padding:0 10px}
  .dimmer input{width:100%;min-height:44px;accent-color:var(--primary-color,#2196f3);margin:0}
  .contact-detail{border-bottom:1px solid var(--room-line);padding:8px 0}
  .contact-detail>div{flex:1;min-width:0}
  .contact-detail strong{font-size:14px;font-weight:500;display:block;overflow-wrap:anywhere}
  .contact-detail small{font-size:12px;color:var(--room-muted);display:block;margin-top:4px}
  .contact-detail time{font-size:12px;color:var(--room-muted)}
  .history{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 10px;margin-top:20px;background:var(--room-soft);text-align:left}
  .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  @container(max-width:310px){
    ha-card{padding:12px}.thermostat,.compact .thermostat{padding:8px}.current{font-size:30px}.target-center{min-width:42px;font-size:18px}.target button{min-width:44px}.unit{font-size:12px}
  }
  @container(max-width:260px){.lights-group .tiles{grid-template-columns:repeat(auto-fit,minmax(58px,1fr))}.thermostat{flex-wrap:wrap}.target{width:100%;justify-content:space-between}.header{flex-wrap:wrap}}
  @media(prefers-reduced-motion:no-preference){.tile{transition:background .15s,color .15s}}
`;
