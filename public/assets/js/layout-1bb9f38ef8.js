!function(){function e(){const e=document.getElementById("sidebar"),t=document.getElementById("friends-sidebar");if(null==e||null==t)return;const n=(document.getElementById("layout-main").getBoundingClientRect().width-document.getElementById("feed-posts").getBoundingClientRect().width)/2;e.style.width=n+"px",t.style.width=n+"px"}function t(){const e=document.getElementById("layout-main"),t=document.getElementById("layout-header").getBoundingClientRect().height,n=window.innerHeight;e.style.height=n-t+"px"}window.addEventListener("resize",t),window.addEventListener("resize",e),t(),e()}();