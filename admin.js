// import data from "./all.js";

function checkRule() {
  let rules = getCookie("role");
  if (rules === null || rules.indexOf("admin") === -1) {
    deleteCookie("userId");
    deleteCookie("token");
    deleteCookie("role");
    alert("請登入管理員帳號。")
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
  adminInit();
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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

const logo = document.querySelector(".logo");
logo.addEventListener("click", function (e) {
  e.preventDefault();
  adminInit();
});

const allSite = document.querySelector(".allSite");
allSite.addEventListener("click", function (e) {
  e.preventDefault();
  adminInit();
});

const adminMain = document.querySelector(".adminMain");
function adminInit() {
  logo.innerHTML = `<a href="../admin.html"
    class="text-decoration-none text-dark">LOGO</a>`;
  let adminStr = "";
  data.views.forEach((item, index) => {
    adminStr += `
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

  adminMain.innerHTML = `<h1>景點列表</h1><div class="row">${adminStr}</div>`

  data.views.forEach((item, index) => {
    let spot = document.querySelector(`.btn${index}`);
    spot.addEventListener("click", function (e) {
      e.preventDefault();
      siteSpot(item, index);
    })
  })
}

async function getStatus(item, index) {
  let url = "https://site-manager-db.onrender.com/600/collects";
  try {
    let c = await axios.get(`${url}/${item.id}`, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    return c.status;
  } catch (error) {
    console.log(error);
    return error.response.status;
  }
}

async function addCollect(item, index) {
  let url = `https://site-manager-db.onrender.com/600/collects`;
  try {
    let newCollect = { ...item };
    newCollect.userId = getCookie("userId");
    let c = await axios.post(url, newCollect, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    alert("收藏成功");
  } catch (error) {
    alert("收藏失敗");
  }
  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;
}


async function rmCollect(id) {
  let url = `https://site-manager-db.onrender.com/600/collects/${id}`;
  try {
    let c = await axios.delete(url, { headers: { "authorization": `Bearer ${getCookie("token")}` } });
    alert("取消收藏");
  } catch (error) {
    alert("取消失敗");
  }

  let c2 = await axios.get(`https://site-manager-db.onrender.com/collects`);
  data.collects = c2.data;
}

async function siteSpot(item, index) {
  let collectionHtml = "";
  if (await getStatus(item, index) !== 200 && await getStatus(item, index) !== 304) {
    collectionHtml += `<a href="#" class="collection">未收藏</a>`;
  } else {
    collectionHtml += `<a href="#" class="collection">已收藏</a>`;
  }

  let text = `<div>${JSON.stringify(data.views[index])}</div>`;

  adminMain.innerHTML = `<h1>景點內文</h1>${collectionHtml}${text}`;

  let collectionBtn = document.querySelector(".collection");
  collectionBtn.addEventListener("click", async function (e) {
    if (collectionBtn.textContent === "未收藏") {
      await addCollect(item, index);
    } else {
      await rmCollect(item.id);
    }
    await siteSpot(item, index);
  });

  // collectionBtn.addEventListener("click", function (e) {
  //   let collectionIndex = data.collects.indexOf(data.views[index]);
  //   if (collectionIndex === -1) {
  //     data.collects.push(data.views[index]);
  //   } else {
  //     data.collects.splice(collectionIndex, 1);
  //   }
  //   siteSpot(item, index);
  // })
}

const logoutBtn = document.querySelector(".logoutBtn");
logoutBtn.addEventListener("click", logout);
function logout() {
  deleteCookie("userId");
  deleteCookie("token");
  deleteCookie("role");
  alert("登出成功");
  window.location.href = "./index.html";
}

const addMain = document.querySelector(".addMain");
const addSiteBtn = document.querySelector(".addSite");
addSiteBtn.addEventListener("click", addSite);
function addSite() {
  logo.innerHTML = `後台`;

  addMain.innerHTML = `
  <div class="mb-3">
    <label for="ControlInput1" class="form-label">標題</label>
    <input type="text" class="form-control newSiteName" id="ControlInput1" placeholder="">
  </div>
  <div class="mb-3">
    <label for="ControlTextarea1" class="form-label">內文</label>
    <textarea class="form-control newSiteDescription" id="ControlTextarea1" rows="3"></textarea>
  </div>
  <button
    type="button"
    class="btn btn-primary addSubmit"
  >新增</button>
  `;

  let newSiteName = document.querySelector(".newSiteName");
  let newSiteDescription = document.querySelector(".newSiteDescription");
  let addSubmit = document.querySelector(".addSubmit");
  addSubmit.addEventListener("click", async function (e) {
    let newSite = {};
    newSite.name = newSiteName.value;
    newSite.description = newSiteDescription.value;
    newSite.id = data.views[data.views.length - 1].id + 1;
    data.views.push(newSite);

    let url = "https://site-manager-db.onrender.com/views";
    try {
      let c = await axios.post(url, newSite);
      alert("新增成功");
      newSiteName.value = "";
      newSiteDescription.value = "";
    } catch (e) {
      console.log(e);
    }

    // alert("新增成功");
    // newSiteName.value = "";
    // newSiteDescription.value = "";
  })

}

const adminBtn = document.querySelector(".admin");
adminBtn.addEventListener("click", admin);
function admin() {
  logo.innerHTML = `後台`;
  let siteStr = "";
  data.views.forEach((item, index) => {
    siteStr += `
    <tr>
      <th class="fw-bold" scope="row">${index + 1}</th>
      <td class="text-nowrap">${item.name}</td>
      <td>${item.description}</td>
      <td><a href="#" class="edit-${item.id}">編輯</a><a href="#" class="link-danger del-${item.id}">移除</a></td>
    </tr>
    `
  })

  adminMain.innerHTML = `
  <table class="table table-light table-hover ">
    <thead class="table-dark">
      <tr>
        <th scope="col">#</th>
        <th scope="col">標題</th>
        <th scope="col">內文</th>
        <th scope="col">編輯</th>
      </tr>
    </thead>
    <tbody class="fs-6">
      ${siteStr}
    </tbody>
  </table>`;

  data.views.forEach((item, index) => {
    let delBtn = document.querySelector(`.del-${item.id}`);
    delBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      delSite(item, index);
    })
  })

  data.views.forEach((item, index) => {
    let editBtn = document.querySelector(`.edit-${item.id}`);
    editBtn.addEventListener("click", function (e) {
      e.preventDefault();
      editSite(item, index);
    });
  })
}

async function delSite(item, index) {
  if (data.views[index].id === item.id) {
    let url = `https://site-manager-db.onrender.com`;
    try {
      await axios.delete(url + `/views/${item.id}`);
      alert("刪除成功");
      if (await getStatus(item, index) === 200 || await getStatus(item, index) === 304) {
        await axios.delete(url + `/collects/${item.id}`);
      }
      let v = await axios.get(url + "/views");
      data.views = v.data;
    } catch (error) {
      alert("刪除失敗");
    }
  }
  admin();
}


function editSite(item, index) {
  logo.innerHTML = `後台`;

  adminMain.innerHTML = `
  <div class="mb-3">
    <label for="ControlInput1" class="form-label">標題</label>
    <input type="text" value="${item.name}" class="form-control newEditName" id="ControlInput1" placeholder="">
  </div>
  <div class="mb-3">
    <label for="ControlTextarea1" class="form-label">內文</label>
    <textarea class="form-control newEditDescription" id="ControlTextarea1" rows="3">${item.description}</textarea>
  </div>
  <button
    type="button"
    class="btn btn-primary editSubmit"
  >修改資料</button>
  `;

  let newEditName = document.querySelector(".newEditName");
  let newEditDescription = document.querySelector(".newEditDescription");
  let editSubmit = document.querySelector(".editSubmit");
  editSubmit.addEventListener("click", async function (e) {
    let editSite = item;
    editSite.name = newEditName.value;
    editSite.description = newEditDescription.value;
    // data.views.splice(data.views.indexOf(item), 1, editSite);

    try {
      let url = `https://site-manager-db.onrender.com`;
      await axios.put(url + `/views/${item.id}`, editSite);
      alert("修改成功");
      if (await getStatus(item, index) === 200 || await getStatus(item, index) === 304) {
        await axios.put(url + `/collects/${item.id}`, editSite);
      }
      let v = await axios.get(url + "/views");
      data.views = v.data;
      admin();
    } catch (error) {
      alert("修改失敗");
    }
  })
}
