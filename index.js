document.addEventListener("DOMContentLoaded", () => {
    const $d = document;
    const selector = (tag) => $d.querySelector(`${tag}`);
    const selectorAll = (tag) => $d.querySelectorAll(`${tag}`);
    const body = selector("BODY");
    const sanitizeInput = (inputSearch) => {
        const div = document.createElement("div");
        div.textContent = inputSearch;
        return div.innerHTML;
    };
    const deleteChildElements = (parentElement) => {
        let child = parentElement.lastElementChild;
        while (child) {
            parentElement.removeChild(child);
            child = parentElement.lastElementChild;
        }
    };
    const deleteArrElements = (parentElement) => {
        while (parentElement.length > 0) {
            parentElement.forEach((item) => {
                parentElement.pop(item);
            });
        }
    };
    const itemsContainer = selector(".item_container");
    const requestTarget = selector(".target");
    const cardTemplate = selector(".card_template").content;
    const fragment = document.createDocumentFragment();

    let loading = true;
    let apiURL = "https://rickandmortyapi.com/api/character/";
    let nextPage;

    const createCard = (data) => {
        let cloneTemplate = cardTemplate.cloneNode(true);
        let img = cloneTemplate.querySelector(".img_item");
        let name = cloneTemplate.querySelector(".name_item");
        let status = cloneTemplate.querySelector(".status_item");
        let iconStatus = cloneTemplate.querySelector(".status");
        let origin = cloneTemplate.querySelector(".origin_item");
        let id = cloneTemplate.querySelector(".id_item");

        if (data.status === "Alive") {
            iconStatus.style.background = "lightgreen";
        } else if (data.status === "Dead") {
            iconStatus.style.background = "red";
        } else {
            iconStatus.style.background = "orange";
        }
        img.src = data.image;
        name.textContent = data.name;
        status.textContent = data.status;
        origin.textContent = data.origin.name;
        id.textContent = data.id;
        fragment.appendChild(cloneTemplate);
    };
    const errorMsgContainer = selector(".error_msg_container");
    const fetchRick = async (api) => {
        //*console.log(api);
        try {
            const resp = await fetch(api);
            const data = await resp.json();
            const respStatus = resp.status;
            if (respStatus === 200) {
                let cloneData = { ...data };
                let newData = JSON.parse(JSON.stringify(cloneData));
                console.log(newData);
                const dataResults = newData.results;
                dataResults.forEach((item) => {
                    createCard(item);
                });
                itemsContainer.appendChild(fragment);

                nextPage = newData.info.next;
                if (!nextPage) {
                    requestTarget.style.display = "none";
                }
                setTimeout(() => {
                    //*console.log(nextPage);
                    loading = false;
                    //*console.log(`Loading... ${loading}`);
                }, 500);
            } else {
                errorMsgContainer.style.display = "block";
                fetchRick(apiURL + "?name=unknown rick");
            }
        } catch {
            //*console.log(error);
        }
    };
    const inputSearch = selector(".search_input");
    fetchRick(apiURL);
    selector(".search_btn").addEventListener("click", () => {
        errorMsgContainer.style.display = "none ";
        requestTarget.style.display = "flex";
        const searchValue = sanitizeInput(inputSearch.value);
        deleteChildElements(itemsContainer);
        deleteArrElements(fragment);
        if (searchValue !== "") {
            fetchRick(apiURL + "?name=" + searchValue);
        } else {
            fetchRick(apiURL);
        }
    });

    const callback = ([entry], observer) => {
        if (!loading && entry.isIntersecting) {
            //*console.log(`Loading... ${loading}`);
            setTimeout(() => {
                //*console.log(entry);
                //*console.log(nextPage);
                loading = true;
                if (nextPage) {
                    fetchRick(nextPage);
                } else {
                    nextPage = null;
                    requestTarget.style.display = "none";
                }
            }, 500);
        }
    };
    const options = {
        threshold: 0.6,
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(requestTarget);
    const refreshBtn = selector(".refresh_btn");
    const upBtn = selector(".up_btn");

    const toTheTop = () => {
        const currentPosition = body.getBoundingClientRect().top;
        window.scrollTo(currentPosition, 0);
    };
    upBtn.addEventListener("click", toTheTop);
    refreshBtn.addEventListener("click", () => {
        deleteChildElements(itemsContainer);
        deleteArrElements(fragment);
        errorMsgContainer.style.display = "none ";
        requestTarget.style.display = "flex";
        inputSearch.value = "";
        fetchRick(apiURL);
    });
});
