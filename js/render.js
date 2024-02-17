function search(keyword, kinds) {
  /*
    트러블슈팅: 실제 데이터가 없을 경우 API 호출을 한 번 실행.
    1. 메뉴에서 검색 버튼을 클릭해서 검색하였을 경우 검색 결과를 renderBlogList 함수를 통해 렌더링
    2. 포스트에서 카테고리를 클릭하였을 때 해당 카테고리로 검색하여 renderBlogList함수를 통해 렌더링
    */
  keyword = keyword ? keyword.toLowerCase().trim() : "";

  if (blogList.length === 0) {
    if (isInitData === false) {
      // 데이터 초기화가 되지 않은 경우에만 검색 허용. 이 작업을 하지 않으면 데이터가 없을 때 무한 루프에 빠지게 됨.
      initDataBlogList().then(() => {
        search(keyword);
      });
      return;
    }
  } else {
    if (!keyword) {
      const searchInput = document.getElementById("search-input");
      const searchKeyword = searchInput.value.toLowerCase(); // 검색어를 소문자로 변환
      const searchResult = blogList.filter((post) => {
        // 대소문자 가리지 않고 검색
        if (post.name.toLowerCase().includes(searchKeyword)) {
          return post;
        }
      });
      renderBlogList(searchResult);
    } else {
      // 만약 kinds가 있을 경우 해당 종류대로 검색(카테고리면 카테고리, 이름이면 이름)
      if (kinds) {
        const searchResult = blogList.filter((post) => {
          if (kinds === "category") {
            // post를 parsing하여 카테고리 내 검색
            const postInfo = extractFileInfo(post.name);
            if (postInfo.category.toLowerCase() === keyword) {
              return post;
            }
          }
        });
        renderBlogList(searchResult);
      } else {
        const searchKeyword = keyword.toLowerCase();
        const searchResult = blogList.filter((post) => {
          // 대소문자 가리지 않고 검색
          if (post.name.toLowerCase().includes(searchKeyword)) {
            return post;
          }
        });
        // 검색 결과를 렌더링
        renderBlogList(searchResult);
      }
    }
  }
}

async function renderMenu() {
  /* 
    1. 메인페이지 메뉴 생성 및 메뉴클릭 이벤트 정의
    2. 검색창과 검색 이벤트 정의(검색이 메뉴에 있으므로) - 함수가 커지면 별도 파일로 분리 필요
    */
  blogMenu.forEach((menu) => {
    // 메뉴 링크 생성
    const link = document.createElement("a");

    // (static) index.html: <div id="contents" class="mt-6 grid-cols-3"></div>
    link.classList.add(...menuListStyle.split(" "));
    link.classList.add(`${menu.name}`);

    link.href = menu.download_url;
    // 확장자를 제외하고 이름만 innerText로 사용
    const menuName = menu.name.split(".")[0];
    link.innerText = menuName;

    link.onclick = (event) => {
      // 메뉴 링크 클릭 시 이벤트 중지 후 menu 내용을 읽어와 contents 영역에 렌더링
      event.preventDefault();

      if (menu.name === "blog.md") {
        if (blogList.length === 0) {
          // 블로그 리스트 로딩
          initDataBlogList().then(() => {
            renderBlogList();
          });
        } else {
          renderBlogList();
        }
        const url = new URL(origin);
        url.searchParams.set("menu", menu.name);
        window.history.pushState({}, "", url);
      } else {
        renderOtherContents(menu);
      }
    };
    document.getElementById("menu").appendChild(link);
  });

  // 검색 버튼 클릭 시 검색창 출력
  const searchButton = document.getElementById("search-button");
  const searchCont = document.querySelector(".search-cont");

  let searchInputShow = false;

  window.addEventListener("click", (event) => {
    if (event.target == searchButton) {
      searchInputShow = !searchInputShow;
      if (searchInputShow) {
        searchButton.classList.add("active");
        searchCont.classList.remove("hidden");
        searchCont.classList.add("block");
      } else {
        searchButton.classList.remove("active");
        searchCont.classList.add("hidden");
        searchInputShow = false;
      }
    } else if (event.target == searchCont) {
    } else {
      searchButton.classList.remove("active");
      searchCont.classList.add("hidden");
      searchInputShow = false;
    }
  });
}

const searchInput = document.getElementById("search-input");
searchInput.onkeyup = (event) => {
  if (event.key === "Enter") {
    // 엔터키 입력 시 검색 실행
    search();
  }
};

searchInput.onclick = (event) => {
  event.stopPropagation();
};

const searchInputButton = document.querySelector(".search-inp-btn");
searchInputButton.onclick = (event) => {
  event.stopPropagation();
  search();
};

function createCardElement(fileInfo, index) {
  /*
    정규표현식으로 파싱된 파일정보 fileInfo를 기반으로 blog의 card 생성, index를 받는 이유는 첫번째 카드는 넓이를 크게 차지해야 하기 때문
    */
  const card = document.createElement("div");
  if (index === 0) {
    card.classList.add(...bloglistFirstCardStyle.split(" "));
  } else {
    card.classList.add(...bloglistCardStyle.split(" "));
  }

  if (fileInfo.thumbnail) {
    const img = document.createElement("img");
    img.src = fileInfo.thumbnail;
    img.alt = fileInfo.title;
    if (index === 0) {
      img.classList.add(...bloglistFirstCardImgStyle.split(" "));
    } else {
      img.classList.add(...bloglistCardImgStyle.split(" "));
    }
    card.appendChild(img);
  }

  const cardBody = document.createElement("div");
  cardBody.classList.add(...bloglistCardBodyStyle.split(" "));

  const category = document.createElement("span");
  category.classList.add(...bloglistCardCategoryStyle.split(" "));
  category.textContent = fileInfo.category;
  cardBody.appendChild(category);

  // category 이벤트 생성으로 카테고리 클릭 시 해당 카테고리로 검색
  category.onclick = (event) => {
    // 클릭했을 때 카드가 클릭되는 것이 아니라 카테고리가 클릭되게 해야함
    event.stopPropagation();
    search(fileInfo.category, "category");
  };

  const title = document.createElement("h2");
  title.classList.add(...bloglistCardTitleStyle.split(" "));
  title.textContent = fileInfo.title;
  cardBody.appendChild(title);

  const description = document.createElement("p");
  if (index == 0) {
    description.classList.add(...bloglistFirstCardDescriptionStyle.split(" "));
  } else {
    description.classList.add(...bloglistCardDescriptionStyle.split(" "));
  }
  description.textContent = fileInfo.description;
  cardBody.appendChild(description);

  const authorDiv = document.createElement("div");
  authorDiv.classList.add(...bloglistCardAuthorDivStyle.split(" "));
  cardBody.appendChild(authorDiv);

  const authorImg = document.createElement("img");
  authorImg.src = users[fileInfo.author]["img"];
  authorImg.alt = users[fileInfo.author]["username"];
  authorImg.classList.add(...bloglistCardAuthorImgStyle.split(" "));
  authorDiv.appendChild(authorImg);

  const author = document.createElement("p");
  author.classList.add(...bloglistCardAuthorStyle.split(" "));
  author.textContent = users[fileInfo.author]["username"];
  authorDiv.appendChild(author);

  const date = document.createElement("p");
  date.classList.add(...bloglistCardDateStyle.split(" "));
  date.textContent = formatDate(fileInfo.date);
  cardBody.appendChild(date);

  card.appendChild(cardBody);

  return card;
}

function renderBlogList(searchResult) {
  /*
    blog의 main 영역에 블로그 포스트 목록을 렌더링
    1. 검색 키워드 없이 대부분 renderBlogList()로 사용.
    2. 검색을 했을 때에만 searchResult에 목록이 담겨 들어옴
    */
  if (searchResult) {
    // 검색 keyword가 있을 경우
    document.getElementById("blog-posts").style.display = "grid";
    document.getElementById("blog-posts").innerHTML = "";
    searchResult.forEach((post, index) => {
      const postInfo = extractFileInfo(post.name);
      if (postInfo) {
        const cardElement = createCardElement(postInfo, index);

        cardElement.onclick = (event) => {
          // 블로그 게시글 링크 클릭 시 이벤트 중지 후 post 내용을 읽어와 contents 영역에 렌더링
          event.preventDefault();
          // contents 영역을 보이게 처리
          document.getElementById("contents").style.display = "block";
          // blog-posts 영역을 보이지 않게 처리
          document.getElementById("blog-posts").style.display = "none";
          fetch(post.download_url)
            .then((response) => response.text())
            .then((text) =>
              postInfo.fileType === "md"
                ? styleMarkdown("post", text, postInfo)
                : styleJupyter("post", text, postInfo)
            )
            .then(() => {
              // 렌더링 후에는 URL 변경(query string으로 블로그 포스트 이름 추가)
              const url = new URL(origin);
              url.searchParams.set("post", post.name);
              window.history.pushState({}, "", url);
            });
        };
        document.getElementById("blog-posts").appendChild(cardElement);
      }
    });
    // contents 영역을 보이지 않게 처리
    document.getElementById("contents").style.display = "none";
  } else {
    // 검색 keyword가 없을 경우
    document.getElementById("blog-posts").style.display = "grid";
    document.getElementById("blog-posts").innerHTML = "";

    // console.log("blogList", blogList);
    blogList.forEach((post, index) => {
      const postInfo = extractFileInfo(post.name);
      if (postInfo) {
        // console.log(postInfo)
        const cardElement = createCardElement(postInfo, index);

        cardElement.onclick = (event) => {
          // 블로그 게시글 링크 클릭 시 이벤트 중지 후 post 내용을 읽어와 contents 영역에 렌더링
          event.preventDefault();
          // contents 영역을 보이게 처리
          document.getElementById("contents").style.display = "block";
          // blog-posts 영역을 보이지 않게 처리
          document.getElementById("blog-posts").style.display = "none";
          // console.log(post)
          // console.log(post.download_url)
          let postDownloadUrl;
          if (!isLocal && localDataUsing) {
            postDownloadUrl = `${url.origin}/${siteConfig.repositoryName}${post.download_url}`;
          } else {
            postDownloadUrl = post.download_url;
          }
          fetch(postDownloadUrl)
            .then((response) => response.text())
            .then((text) =>
              postInfo.fileType === "md"
                ? styleMarkdown("post", text, postInfo)
                : styleJupyter("post", text, postInfo)
            )
            .then(() => {
              // 렌더링 후에는 URL 변경(query string으로 블로그 포스트 이름 추가)
              const url = new URL(origin);
              url.searchParams.set("post", post.name);
              window.history.pushState({}, "", url);
            });
        };
        document.getElementById("blog-posts").appendChild(cardElement);
      }
    });
    // contents 영역을 보이지 않게 처리
    document.getElementById("contents").style.display = "none";
  }
}

function renderOtherContents(menu) {
  /*
    menu에 다른 콘텐츠, 예를 들어 about이나 contect를 클릭했을 때 렌더링 하는 함수
    */
  // main 영역에 blog.md를 제외한 다른 파일을 렌더링
  document.getElementById("blog-posts").style.display = "none";
  document.getElementById("contents").style.display = "block";

  // 만약 menu가 string type 이라면 download_url, name을 menu로 설정
  if (typeof menu === "string") {
    menu = {
      download_url: origin + "menu/" + menu,
      name: menu.split("/")[menu.split("/").length - 1],
    };
  }
  // console.log(menu)
  // console.log(menu.download_url)
  let menuDownloadUrl;
  if (!isLocal && localDataUsing) {
    menuDownloadUrl = menu.download_url = `${url.origin}/${siteConfig.repositoryName}${menu.download_url}`;
  } else {
    menuDownloadUrl = menu.download_url;
  }
  fetch(menuDownloadUrl)
    .then((response) => response.text())
    .then((text) => styleMarkdown("menu", text, undefined))
    .then(() => {
      // 렌더링 후에는 URL 변경(query string으로 블로그 포스트 이름 추가)
      const url = new URL(origin);
      url.searchParams.set("menu", menu.name);
      window.history.pushState({}, "", url);
    });
}

function renderBlogCategory() {
  /*
    blogList에서 카테고리를 소문자로 추출하여 카테고리 목록을 aside 항목으로 렌더링
    */
  const categoryList = {};
  blogList.forEach((post) => {
    const postInfo = extractFileInfo(post.name);
    if (postInfo) {
      if (categoryList[postInfo.category.toLowerCase()]) {
        categoryList[postInfo.category.toLowerCase()] += 1;
      } else {
        categoryList[postInfo.category.toLowerCase()] = 1;
      }
    }
  });
  const categoryArray = Object.keys(categoryList);
  categoryArray.sort();

  const categoryContainer = document.querySelector("aside");
  categoryContainer.classList.add(...categoryContainerStyle.split(" "));

  const categoryWrapper = document.querySelector(".category-aside");
  const categoryTitle = categoryWrapper.querySelector(".aside-tit");
  const categoryButton = document.getElementById("aside-button");
  window.addEventListener("click", (evt) => {
    // categoryButton을 눌렀을 때
    if (evt.target === categoryButton) {
      categoryWrapper.classList.toggle("active");
      categoryTitle.classList.toggle("sr-only")
      categoryContainer.classList.toggle("md:flex");
    } else if (
      categoryWrapper.classList.contains("active") && !categoryWrapper.contains(evt.target)
    ) {
      categoryWrapper.classList.remove("active");
      categoryTitle.classList.add("sr-only")
      categoryContainer.classList.remove("md:flex");
    }
  });

  categoryArray.unshift("All");

  categoryArray.forEach((category) => {
    // category div
    const categoryItem = document.createElement("div");

    // category count span
    const categoryCount = document.createElement("span");

    if (categoryList[category]) {
      categoryItem.classList.add(...categoryItemStyle.split(" "));
      categoryItem.textContent = category;
      categoryItem.onclick = (event) => {
        search(category, "category");
      };

      categoryCount.classList.add(...categoryItemCountStyle.split(" "));
      categoryCount.textContent = `(${categoryList[category]})`;
    } else {
      categoryItem.classList.add(...categoryItemStyle.split(" "));
      categoryItem.textContent = category;
      categoryItem.onclick = (event) => {
        search();
      };

      categoryCount.classList.add(...categoryItemCountStyle.split(" "));
      categoryCount.textContent = `(${blogList.length})`;
    }

    categoryItem.appendChild(categoryCount);
    categoryContainer.appendChild(categoryItem);
  });
}

async function initialize() {
  /*
    최초 실행 함수, URLparsing은 이 영역에서 담당하지 않고 index.html에서 로드 될 때 실행, blogList와 blogMenu는 initData.js에서 정의되고 로드될 때 실행. 다만 함수의 흐름을 파악하고자 이곳으로 옮겨올 필요성이 있음
    
    TODO: URL 파싱 결과 상세 블로그나 메뉴상태이면 검색 버튼을 누르기 전까지는 initDataBlogList()를 실행시킬 필요 없음. 이를 통해 API 호출 한 번을 아낄 수 있음.
    */
  if ((!url.search.split("=")[1]) || (url.search.split("=")[1] === "blog.md")) {
    // 메뉴 로딩
    await initDataBlogMenu();
    renderMenu();

    // 블로그 리스트 로딩
    await initDataBlogList();
    renderBlogList();

    // 블로그 카테고리 로딩
    renderBlogCategory();
  } else {
    // 메뉴 로딩
    await initDataBlogMenu();
    renderMenu();

    // 블로그 상세 정보 로딩
    if (url.search.split("=")[0] === "?menu") {
      document.getElementById("blog-posts").style.display = "none";
      document.getElementById("contents").style.display = "block";
      fetch(origin + "menu/" + url.search.split("=")[1])
        .then((response) => response.text())
        .then((text) => styleMarkdown("menu", text))
        .then(() => {
          // 렌더링 후에는 URL 변경(query string으로 블로그 포스트 이름 추가)
          const url = new URL(window.location.href);
          window.history.pushState({}, "", url);
        });
    } else if (url.search.split("=")[0] === "?post") {
      document.getElementById("contents").style.display = "block";
      document.getElementById("blog-posts").style.display = "none";
      postNameDecode = decodeURI(url.search.split("=")[1]).replaceAll("+", " ");
      // console.log(postNameDecode);
      postInfo = extractFileInfo(postNameDecode);
      fetch(origin + "blog/" + postNameDecode)
        .then((response) => response.text())
        .then((text) =>
          postInfo.fileType === "md"
            ? styleMarkdown("post", text, postInfo)
            : styleJupyter("post", text, postInfo)
        )
        .then(() => {
          // 렌더링 후에는 URL 변경(query string으로 블로그 포스트 이름 추가)
          const url = new URL(window.location.href);
          window.history.pushState({}, "", url);
        });
    }
  }
}

initialize();
