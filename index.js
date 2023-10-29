const loginBtn = document.querySelector(".login");
const signUpBtn = document.querySelector(".signUp");
const main = document.querySelector(".main");
const site = document.querySelector(".site");
// const nav = document.querySelector("nav.navbar");

// import data from "./all.js";
let data = {};
async function getData() {
  let url = "https://site-manager-db.onrender.com";
  try {
    let v = await axios.get(url + "/views");
    data.views = v.data;
    // navInit();
    siteInit();
  } catch (e) {
    console.log(e);
  }
}
getData();

let emailAndPassword = `<div class="mb-3">
<label
  for="exampleInputEmail1"
  class="form-label"
>信箱：</label>
<input
  type="email"
  class="form-control email"
  id="exampleInputEmail1"
  aria-describedby="emailHelp"
>
</div>
<div class="mb-3">
<label
  for="exampleInputPassword1"
  class="form-label"
>密碼：</label>
<input
  type="password"
  class="form-control pwd"
  id="exampleInputPassword1"
>
</div>`;

async function signUpAPI(data) {
  let url = "https://site-manager-db.onrender.com/signUp";
  try {
    let v = await axios.post(url, data);
    alert("註冊成功");
    login();
  } catch (e) {
    console.log(e);
    alert(e.response.data);
  }
}

function signUp(e) {
  main.innerHTML = `<h1>註冊</h1>
  <form>
  ${emailAndPassword}
  <button
    type="button"
    class="btn btn-primary signUpSubmit"
  >註冊帳號</button>
  </form>`;

  let email = document.querySelector(".email");
  let pwd = document.querySelector(".pwd");
  // let sendData = [email.value, pwd.value];
  // 為什麼用變數接，再回傳變數就不行阿...

  let signUpSubmit = document.querySelector(".signUpSubmit");

  signUpSubmit.addEventListener("click", function (e) {
    e.preventDefault();
    signUpAPI({ "email": email.value, "password": pwd.value, "role": ["normal user"] });
    // alert(JSON.stringify(sendData))
    // alert([email.value, pwd.value])
  })
}

let token = "";
async function loginAPI(data) {
  let url = "https://site-manager-db.onrender.com/login";
  try {
    let v = await axios.post(url, data);
    alert("登入成功");
    // document.cookie = `userId=${v.data.user.id}; token=${v.data.accessToken}`;

    document.cookie = `userId=${v.data.user.id}`;
    document.cookie = `token=${v.data.accessToken}`;
    document.cookie = `role=${v.data.user.role}`;
    if (v.data.user.role.indexOf("admin") !== -1) {
      window.location.href = "./admin.html";
    } else {
      window.location.href = "./site.html";
    }
  } catch (e) {
    console.log(e);
    alert(e.response.data);
  }
}

function login(e) {
  main.innerHTML = `<h1>登入</h1>
  <form>
  ${emailAndPassword}
  <button
    type="button"
    class="btn btn-primary loginSubmit"
  >登入</button>
  </form>`;
  let loginSubmit = document.querySelector(".loginSubmit");

  let email = document.querySelector(".email");
  let pwd = document.querySelector(".pwd");

  loginSubmit.addEventListener("click", function (e) {
    e.preventDefault();
    loginAPI({ "email": email.value, "password": pwd.value });
  })
}

// function navInit() {
//   nav.innerHTML = `
//   <div class="container justify-content-between">
//     <h5 class="col-1 m-0 logo"><a href="../index.html"
//       class="text-decoration-none text-dark">LOGO</a></h5>
//     <div class="col-2 text-right d-flex justify-content-end">
//       <button class="btn btn-outline-primary mx-2 login">登入</button>
//       <button class="btn btn-primary signUp">註冊</button>
//     </div>
//   </div>
//   `;

//    signUpBtn.addEventListener("click", signUp);
//    loginBtn.addEventListener("click", login);
// }

signUpBtn.addEventListener("click", signUp);
loginBtn.addEventListener("click", login);


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
      siteSpot(index);
    })
  })
}

function siteSpot(index) {
  let collectionHtml = "";
  collectionHtml += `<a href="#" class="collection">未收藏</a>`;

  let text = `<div>${JSON.stringify(data.views[index])}</div>`;

  site.innerHTML = `<h1>景點內文</h1>${collectionHtml}${text}`;

  let collectionBtn = document.querySelector(".collection");
  collectionBtn.addEventListener("click", function (e) {
    alert("請先登入");
    login();
  })
}
