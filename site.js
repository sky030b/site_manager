// import data from "./all.js";

function checkRule() {
  let rules = getCookie("role");
  if (rules === null || rules.indexOf("normal user") === -1) {
    deleteCookie("userId");
    deleteCookie("token");
    deleteCookie("role");
    alert("請先登入。")
    window.location.href = "./index.html";
  }
}

let data = {};
async function getData() {
  let url = "https://site-manager-db.onrender.com";
  try {
    let v = await axios.get(url + "/views");
    data.views = v.data;
    let c = await axios.get(url + "/collects");
    data.collects = c.data;
  } catch (e) {
    console.log(e);
    data.collects = [];
  }
  checkRule();
  siteInit();
}
getData();

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      if (cookieValue.indexOf(",") === -1) {
        return cookieValue;
      } else {
        return cookieValue.split(",");
      }
    }
  }
  return null;
}

function deleteCookie(name) {
  // document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // 加了path好像就不行了
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

async function getStatus(item, index) {
  // let url = "https://site-manager-db.onrender.com/600/collects";
  // try {
  //   let c = await axios.get(`${url}/${item.id}`, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
  //   return c.status;
  // } catch (error) {
  //   console.log(error);
  //   return error.response.status;
  // }

  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;

  let pointerId = 0;
  for (let i = 0; i < data.collects.length; i++) {
    if (data.collects[i].viewId == item.id && data.collects[i].userId == getCookie("userId")) {
      pointerId = data.collects[i].id;
      break;
    }
  }

  console.log(123)
  try {
    let url = "https://site-manager-db.onrender.com/600/collects";
    let c = await axios.get(`${url}/${pointerId}`, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    return c.status;
  } catch (error) {
    console.log(error);
    return error.response.status;
  }
}

async function addCollect(item, index) {
  try {
    let newCollect = {};
    newCollect.viewId = item.id;
    newCollect.name = item.name;
    newCollect.description = item.description;
    newCollect.userId = getCookie("userId");
    let url = `https://site-manager-db.onrender.com/600/collects`;
    let c = await axios.post(url, newCollect, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    alert("收藏成功");
  } catch (error) {
    alert("收藏失敗");
  }
  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;
}

async function rmCollect(viewId) {
  // let url = `https://site-manager-db.onrender.com/600/collects/${id}`;
  // try {
  //   let c = await axios.delete(url, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
  //   alert("取消收藏");
  // } catch (error) {
  //   alert("取消失敗");
  // }

  // let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  // data.collects = c2.data;

  try {
    // let c2 = await axios.get(url + "/collects");
    // data.collects = c2.data;
    let pointerId = 0;
    for (let i = 0; i < data.collects.length; i++) {
      if (data.collects[i].viewId == viewId && data.collects[i].userId == getCookie("userId")) {
        pointerId = data.collects[i].id;
      }
    }
    console.log(77)
    let url = `https://site-manager-db.onrender.com/600/collects/${pointerId}`;
    let c = await axios.delete(url, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    alert("取消收藏");
  } catch (error) {
    alert("取消失敗");
  }
  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;

}

const logo = document.querySelector(".logo");
logo.addEventListener("click", function (e) {
  e.preventDefault();
  siteInit();
});

const site = document.querySelector(".site");
function siteInit() {
  let cardStr = "";
  data.views.forEach((item, index) => {
    cardStr += `
    <div
      class="card card${index} m-1"
      style="width: 17rem;"
    >
      <div class="card-body d-inline-block p-2">
        <h5 class="card-title fs-4 fw-bold">${item.name}</h5>
        <p
          class="card-text fs-6 w-100 text-truncate"
          style="width: 100%; height: 1.5rem;"
        >
          ${item.description}
        </p>
        <a
          href="#"
          class="btn btn-primary btn${index}"
        >看詳細</a>
      </div>
    </div>
    `
  });

  site.innerHTML = `<h1>景點列表</h1><div class="row">${cardStr}</div>`

  data.views.forEach((item, index) => {
    let spot = document.querySelector(`.btn${index}`);
    spot.addEventListener("click", function (e) {
      e.preventDefault();
      siteSpot(item, index);
    })
  })
}

async function siteSpot(item, index) {
  // let collectionHtml = "";
  // if (data.collects.indexOf(data.views[index]) === -1) {
  //   collectionHtml += `<a href="#" class="collection">未收藏</a>`;
  // } else {
  //   collectionHtml += `<a href="#" class="collection">已收藏</a>`;
  // }

  let collectionHtml = "";
  if (await getStatus(item, index) !== 200 && await getStatus(item, index) !== 304) {
    collectionHtml += `<a href="#" class="collection">未收藏</a>`;
  } else {
    collectionHtml += `<a href="#" class="collection">已收藏</a>`;
  }

  let text = `<div>${JSON.stringify(data.views[index])}</div>`;

  site.innerHTML = `<h1>景點內文</h1>${collectionHtml}${text}`;

  let collectionBtn = document.querySelector(".collection");
  collectionBtn.addEventListener("click", async function (e) {
    if (collectionBtn.textContent === "未收藏") {
      await addCollect(item, index);
    } else {
      await rmCollect(item.id);
    }
    await siteSpot(item, index);
  });

  // let collectionBtn = document.querySelector(".collection");
  // collectionBtn.addEventListener("click", function (e) {
  //   let collectionIndex = data.collects.indexOf(data.views[index]);
  //   if (collectionIndex === -1) {
  //     data.collects.push(data.views[index]);
  //   } else {
  //     data.collects.splice(collectionIndex, 1);
  //   }
  //   siteSpot(item,index);
  // })
}

async function showCollected() {
  let collectedStr = "";

  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;

  data.collects.forEach((item, index) => {
    if (item.userId == getCookie("userId")) {
      collectedStr += `
      <div
        class="card card${item.id} m-1"
        style="width: 17rem;"
      >
        <div class="card-body d-inline-block p-2">
          <h5 class="card-title fs-4 fw-bold">${item.name}</h5>
          <p
            class="card-text fs-6 w-100 text-truncate"
            style="width: 100%; height: 1.5rem;"
          >
            ${item.description}
          </p>
          <a
            href="#"
            class="btn btn-primary collection-${item.id}"
          >已收藏</a>
        </div>
      </div>
      `;
    }
  });


  if (collectedStr === "") {
    collectedStr = `<div class="container">目前尚無收藏景點。</div>`
  }
  site.innerHTML = `<h1>收藏列表</h1><div class="row">${collectedStr}</div>`

  data.collects.forEach((item, index) => {
    if (item.userId == getCookie("userId")) {
      let collected = document.querySelector(`.collection-${item.id}`);
      collected.addEventListener("click", async function (e) {
        e.preventDefault();
        await rmCollect(item.viewId);
        await showCollected();
      })
    }
  })
}
const collected = document.querySelector(".collected");
collected.addEventListener("click", showCollected);

function logout() {
  deleteCookie("userId");
  deleteCookie("token");
  deleteCookie("role");
  alert("登出成功");
  window.location.href = "./index.html";
}
const logoutBtn = document.querySelector(".logoutBtn");
logoutBtn.addEventListener("click", logout);
