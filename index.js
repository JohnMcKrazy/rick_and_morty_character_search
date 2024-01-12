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
        let img = cloneTemplate.querySelector(".img_answer_card");
        let name = cloneTemplate.querySelector(".name_answer_card");
        let status = cloneTemplate.querySelector(".status_answer_card");
        let iconStatus = cloneTemplate.querySelector(".status_icon_answer_card");
        let origin = cloneTemplate.querySelector(".origin_answer_card");
        let infoBtn = cloneTemplate.querySelector(".info_btn");

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
        infoBtn.setAttribute("data-id", data.id);
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
                    selectorAll(".info_btn").forEach((btn) => {
                        btn.addEventListener("click", async () => {
                            const modal = selector(".modal");
                            try {
                                const resp = await fetch("https://rickandmortyapi.com/api/character/" + btn.getAttribute("data-id"));
                                const data = await resp.json();
                                const respStatus = resp.status;
                                if (respStatus === 200) {
                                    console.log(data);
                                    modal.style.display = "block";
                                    const img = modal.querySelector("IMG");
                                    const status = modal.querySelector(".status_answer_modal");
                                    const iconStatus = modal.querySelector(".status_icon_answer_modal");
                                    const name = modal.querySelector(".name_answer_modal");
                                    const gender = modal.querySelector(".gender_answer_modal");
                                    const species = modal.querySelector(".species_answer_modal");
                                    const origin = modal.querySelector(".origin_answer_modal");
                                    const location = modal.querySelector(".location_answer_modal");
                                    img.src = data.image;
                                    if (data.status === "Alive") {
                                        iconStatus.style.background = "lightgreen";
                                    } else if (data.status === "Dead") {
                                        iconStatus.style.background = "red";
                                    } else {
                                        iconStatus.style.background = "orange";
                                    }
                                    status.textContent = data.status;
                                    name.textContent = data.name;
                                    gender.textContent = data.gender;
                                    species.textContent = data.species;
                                    origin.textContent = data.origin.name;
                                    location.textContent = data.location.name;
                                    setTimeout(() => {
                                        modal.style.opacity = 1;
                                    }, 200);
                                } else {
                                    console.log("esto no deberia de aparecer");
                                }
                            } catch {
                                //*console.log(error);
                            }
                        });
                    });
                    //*console.log(`Loading... ${loading}`);
                }, 500);
            } else {
                errorMsgContainer.style.display = "block";
                fetchRick(apiURL + "?name=unknown rick          ");
            }
        } catch {
            //*console.log(error);
        }
    };
    const inputSearch = selector(".search_input");
    fetchRick(apiURL);
    const searchFunction = () => {
        errorMsgContainer.style.display = "none ";
        requestTarget.style.display = "flex";
        const searchValue = sanitizeInput(inputSearch.value);
        deleteChildElements(itemsContainer);
        deleteArrElements(fragment);
        setTimeout(() => {
            if (searchValue !== "") {
                fetchRick(apiURL + "?name=" + searchValue);
            } else {
                fetchRick(apiURL);
            }
        }, 500);
    };
    selector(".search_btn").addEventListener("click", searchFunction);
    inputSearch.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchFunction();
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

    selector(".close_btn").addEventListener("click", () => {
        const modal = selector(".modal");
        modal.style.opacity = 0;
        setTimeout(() => {
            modal.style.display = "none";
        }, 1000);
    });
});
