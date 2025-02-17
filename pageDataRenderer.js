/*
# 사용 전 필요한 플러그인 
- 필수 : dataview
- 선택 (없이도 작동됨) : templater / customjs / minimal theme

# 작성형식
```dataviewjs
let input = {
	"pages": '#독서',
	"row" : 'cover_url, file.link, author, finish_read_date, tags',
	"selectedValue": 20,
	"filter" : [
		{
			"label" : "📕 완독서",
			"class": "진행여부",
			"type": "property",
			"target": "status",
			"target_content": "true",
		},
		{
			"label" : "📖 읽고 있는 책",
			"class": "진행여부",
			"type": "property",
			"target": "status",
			"target_content": "false"
		},
		{
			"label" : "eBook만",
			"class": "도서분류",
			"type": "property",
			"target": "category",
			"target_content": "eBook"
		},
		{
			"label" : "영어공부만",
			"class": "도서분류",
			"type": "tags",
			"target": "영어",
			"target_isInclude": "true"
		},
		{
			"label" : "프로그래밍만",
			"class": "도서분류",
			"type": "tags",
			"target": "프로그래밍",
			"target_isInclude": "true"
		},
	],
	"filterDefault": ["📖 읽고 있는 책"],
	"sort" : [
		{
			"label": "완독일순 (최신순)",
			"type": "finish_read_date",
			"sort": "desc"
		},
		{
			"label": "완독일순 (오래된순)",
			"type": "finish_read_date",
			"sort": "asc"
		}
	],
	"sortDefault": 1,
	"option": ["useFilterModal", "useSearchBtn"]
}
await dv.view("etc/module/views/pageDataRenderer", input) 
```

# 필수 변수
- pages
- row

# 선택적 변수
- selectedValue : (number) 표시할 페이지 수를 작성
- sortDefault : (number 0 / 1) : 최신순 / 오래된순으로 기본적으로 정렬할 것인지 선택
- filter 
	- 배열형식으로 작성
	- 변수 목록
		- label : 표시될 값을 작성
		- type : tags(프로퍼티 내의 tags만 검사), property, file.tags (파일내 존재하는 tags를 모두 검사)
		- target : 태그나 속성명을 작성
		- target_isInclude : (true/ false) tags나 property가 해당 md 문서에 존재하는지 판단
		- target_content : property만 사용) property에 해당 내용이 존재하는지 체크
		- class : (선택적) 필터 분류
- filterDefault : filter 중 기본적으로 사용하고 싶은 필터가 있을 경우 해당 필터의 label을 작성해서 사용
- sort : sort를 추가할 수 있음
- sortDefault : sort 중에서 기본적으로 사용하고 싶은 필터가 있을 경우 해당 번호 작성 (0부터 시작하므로 주의)
- option
	- useFilterModal : 필터를 모달로
	- useSortModal : 정렬창을 모달로 
	- useSearchBtn : 검색창을 버튼으로
	- useSearchModal: 검색창을 모달로, (useSearchBtn과 함께 사용하지 않아도 됨)

# 변경기록
- 24/02/04 : 초기버전
- 24/02/19 : imgLocal 버그 수정
- 24/03/24
	- header, option, sortDefault 추가
	- filter 개선 
		- 중첩필터 가능
		- 필터된 아이템을 한눈에 볼수 있도록 
	- csv 지원 (모든 기능 지원)		
		- 엑셀과 호환되므로 엑셀을 사용하는 것도 좋음 (주의 : csv UTF-8로 저장할 것)
		- csv 작성규칙
			- 내부 이미지를 불러오고 싶은 경우
				- csv를 통해 이미지를 표시하고 싶은 경우 ![[파일이름]] 형식으로 작성
				- 이미지를 링크로 사용하고 싶은 경우 [![[파일이름]]](링크) 형식으로 작성
			- 외부 이미지는 <img src="이미지 경로"> 형식으로 작성
			- 이미지 파일을 두개이상 추가할 경우 "" 따음표로 묶고 ,으로 구분할것
			- 필터는 metadata라는 col를 추가해야 작동
		- 해당 dataviewjs 파일을 통해 csv를 불러올 경우 작성형식
			- "pages": "csv/파일/경로.csv"로 작성 할 것
			- metadata col을 통해서 배열 값을 불러오므로 "filter"를 작성할 필요 없음
		- 모바일에서는 csv 데이터 추가기능이 작동하지 않음
	- cssClass 추가
		- cards-wide: 카드 너비를 340px로 넓힘
- 24/03/27 : 필터 분류기능 추가, 새로운 필터 변수 class를 통해 필터를 분류가능
- 24/04/02 : 깃허브 업로드
- 24/04/13
	- 기본적으로 file.link와 cover_url을 추가하던 것을 폐기. 이제부터는 row에 작성해야 표시
	- HasImgLocal 변수 제거
	- filter 기능에 file.name, file.aliases, file.inlinks, file.outlinks 변수 지원 추가
	- 이제부터 검색은 file.name 뿐만 아니라 file.aliases도 검사
- 24/04/15
	- 이제부터 cover_url에 일일히 대표 이미지를 지정하지 않아도 자동으로 문서 내부의 이미지를 불러와 줌 (아쉽게도 로컬 이미지만 가능)
	- 더이상 advanced-uri가 없이도 작동
- 24/04/16
	- 모바일 버그 수정
- 24/04/21
	- 자료형 실수한 거 수정
*/

// Access Obsidian API
const plugins = app.plugins.plugins
let obsidian
if (plugins["templater-obsidian"]) {
    // Trying to get API from Templater
    obsidian = app.plugins.plugins["templater-obsidian"].templater.functions_generator.additional_functions().obsidian
} else if (plugins["customjs"]) {
    // Trying to get API from CustomJS
    obsidian = customJS.obsidian
} else {
    // Generate mockup plugin to load API
    if (!app.ObsidianAPI) {
        const dir = `${app.vault.configDir}/plugins/extract-obsidian-api`;
        await app.vault.adapter.mkdir(dir);
        const moduleFunc = () => {
            app.ObsidianAPI = require('obsidian');
            exports.default = app.ObsidianAPI.Plugin;
        };
        await app.vault.adapter.write(`${dir}/main.js`, `(${moduleFunc})();`);
        await app.vault.adapter.write(`${dir}/manifest.json`, `{"id":"extract-obsidian-api","name":"extract-obsidian-api","version":"1", "description":""}`);
        await app.plugins.loadManifests()
        await app.plugins.loadPlugin('extract-obsidian-api');
    }
    obsidian = app.ObsidianAPI
}

// Variables
const isMobile = app.isMobile;
const isCsv = await GetFileIncludesCSV(input.pages);

// String
const MOD_CHECKED = "mod-checked";
const IS_ACTIVE = "is-active";
const Has_ACTIVE = "has-active-menu";

// Create Elements 
class DataRenderer {
	constructor(input, pages) {
		this.input = input;
		this.pages = pages;
		this.pageInitial = pages;

		// Variables
		this.MAX_BUTTONS_TO_SHOW = isMobile ? 5 : 10;
		
		this.currentPage = 1;
		this.startButton = 1;
		
		this.selectedValue = Number(input.selectedValue) || 10;
		this.selectArr = new Set([5, 10, 20, 30, 40, 50]);
		this.selectArr.add(this.selectedValue);
		this.selectArr = Array.from(this.selectArr).sort((a, b) => a - b);

		this.fullPagination = Math.ceil(pages.length / this.selectedValue);
		if(this.fullPagination <= 0) this.fullPagination = 1;
		this.endButton = Math.min(this.fullPagination, this.startButton + this.MAX_BUTTONS_TO_SHOW -1);

		// filter setting
		this.filter = []; // Object Arr
		this.selectFilterValue = []; // Number Arr
		this.filterClassNameList = []; // String Arr
		this.filterClassList = []; // Object Arr
		if(input.filter && !isCsv) {
			// 필터 코드가 존재할 경우
			this.filter.push({"label": "모두보기"}, ...input.filter);

			const classNameList = new Set();
			this.filter.forEach((item, index) => {
				// 필터내부에서 분류가 존재할 경우
				if (item.class) {
					classNameList.add(item.class);
					this.filterClassList.push({"index" : index, "class": item.class})
				}
				
				// 기본적으로 사용하는 필터 추출
				if (input.filterDefault && index != 0 && input.filterDefault.some((b) => b === item.label)) {
					this.selectFilterValue.push(index);
				}
			})
			this.filterClassNameList = [...classNameList].sort();

		} else if (isCsv && pages.metadata.values.length !== 0) {
			// CSV 필터
			const metadataList = new Set();
			for (let item of pages.metadata.values) {
				item = item.toLowerCase().trim();
				if (item.includes(",")) {
					item.split(",").forEach((i) => metadataList.add(i.toLowerCase().trim()));
				} else {
					metadataList.add(item);
				}
			}
			this.filter = [...metadataList].sort();
			this.filter.unshift(["모두보기"]);
			if (input.filterDefault) {
				this.filter.forEach((item, index) => {
					if (input.filterDefault && index != 0 && input.filterDefault.some((b) => b.toLowerCase().trim() === item)) {
						this.selectFilterValue.push(index);
					}
				})
			}
		}
		
		// sort setting 
		this.sort = [
			{
				"label": "생성일순 (최신순)",
				"type": "created",
				"sort": "desc"
			},
			{
				"label": "생성일순 (오래된순)",
				"type": "created",
				"sort": "asc"
			}
		];
		if (!isCsv) {
			this.sort.push(
			{
				"label": "업데이트일순 (최신순)",
				"type": "file.cday",
				"sort": "desc"
			},
			{
				"label": "업데이트일순 (오래된순)",
				"type": "file.cday",
				"sort": "asc"
			},
			{
				"label": "파일이름 (알파벳순)",
				"type": "file.link",
				"sort": "asc"
			},
			{
				"label": "파일이름 (알파벳 역순)",
				"type": "file.link",
				"sort": "desc"
			});
		}
		// 사용자가 입력한 sort가 있을 경우
		if (input.sort) this.sort.push(...input.sort);

		this.selectSortValue = Number(input.sortDefault) || 0;
		if (this.selectSortValue === 0) {
			this.pages.values = this.pages.values.reverse();
		}

		// option setting
		this.useFilterModal = (input.option)? input.option.includes("useFilterModal") : false;
		this.useSortModal = (input.option)? input.option.includes("useSortModal") : false;
		this.useSearchModal = (input.option)? input.option.includes("useSearchModal") : false;
		this.useSearchBtn = (input.option)? input.option.includes("useSearchBtn") : false;
	}
	// 변수 설정 메소드
	async setPages(pages) {
		this.pages = pages;
		this.setEndButton();
	}
	async setSelectValue(selectedValue) {
		this.selectedValue = Number(selectedValue);
		this.setEndButton();
	}
	async setCurrentPage(currentPage) {
		this.currentPage = Number(currentPage);
	}
	async setStartButton(startButton) {
		this.startButton = Number(startButton);
		this.setEndButton();
	}
	async setEndButton() {
		this.fullPagination = Math.ceil(this.pages.length / this.selectedValue);
		if(this.fullPagination <= 0) this.fullPagination = 1;
		this.endButton = Math.min(this.fullPagination, this.startButton + this.MAX_BUTTONS_TO_SHOW -1);
	}
	async setSelectFilterValue(selectFilterValue) {
		this.selectFilterValue = selectFilterValue;
	}
	async setSelectSortValue(selectSortValue) {
		this.selectSortValue = selectSortValue;
	}
	/** 페이지 초기화 함수 */
	async resetPages() {
		this.currentPage = 1;
		this.startButton = 1;
		this.setEndButton();
	}
	
	// ele 생성
	/** 타이틀 생성 */
	async createHeader() {
		return `<h2 class="HyperMD-header HyperMD-header-2 title">
					<span class="cm-header cm-header-2">${this.input.header}</span>
				</h2>`
	}
	
	/** select 생성 */
	async createSelect() {
		let item = "";
		for (let value of this.selectArr) {
			let template = `<option value="${value}" ${(value === this.selectedValue)? "selected=":""}>${value}</option>`
			item += template;
		}
		let result = `<select class="selectPageNum dropdown" aria-label="현재 표시되는 페이지 수 조절">${item}</select>`;

		return result;
	}
	/** pagination 생성 */
	async createPagination() {
		let result = "";

		for (let i = this.startButton; i <= this.endButton; i++) {
			let template = `<button ${(i === this.currentPage)? "class='page-item is-active'":"class='page-item'"} >${i}</button>`
			result += template;
		}

		return result;
	}
	async createSearch() {
		const searchContainer  = `<div class="search-input-container" >
									<input class="textSearch" enterkeyhint="search" type="search" spellcheck="false" placeholder="입력하여 검색 시작…">
									<div class="search-input-clear-button"></div>
								</div>`;
		const searchButton = `<button class="searchBtn clickable-icon" aria-label="검색 필터 보기"><svg class="svg-icon lucide-search" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>`;
		let result = "";
		if (isMobile || this.useSearchModal) {
			result = searchButton;
		} else {
			result = (this.useSearchBtn) ?  searchContainer + searchButton : searchContainer;
		}
		return result;
	}

	async createFilter() {
		const filterItem = await this.createFilterItem();

		let result = "";
		
		if (this.filterClassNameList.length !== 0) {
			for(let i = 0; i <= this.filterClassNameList.length; i++) {
				const className = this.filterClassNameList[i];
				if (className !== undefined) {
					let item = "";
					filterItem.forEach((value) => {
						if (this.filterClassList.some((b) => b.class === className) && className === value.class) {
							item +=	value.template;
						}
					})
					result += `
					<button class="filteringBtn clickable-icon nav-action-button" aria-label="필터 보기">
						<span>${className}</span>
						<div class="filtering_menu menu">${item}</div>
					</button>
					`
				} 
			}
		} 

		let item = "";
		filterItem.forEach((value) => {
			if (value.class === undefined) item +=	value.template;
		})
		result += `
			<button class="filteringBtn clickable-icon nav-action-button" aria-label="필터 보기">
				<svg class="svg-icon lucide-filter" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
					<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
				</svg>
				<div class="filtering_menu menu">${item}</div>
			</button>
		`;

		return result;
	}

	/** 필터 아이템 생성 */
	async createFilterItem() {
		const item = [];
		this.filter.forEach((value, index) => {
			let template = `
				<div class="menu-item ${(this.selectFilterValue.length === 0 && index === 0)? MOD_CHECKED : this.selectFilterValue.some(val => index === val) ? MOD_CHECKED:""}" data-index="${index}">
					<span>${(isCsv)? value : value.label}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
				</div>
			`
			item.push({"index": index, "class": value.class, "template": template})
		});
		return item;
	}
	async createUseFilterItem() {
		let item = "";
		this.selectFilterValue.forEach((value) => {
			const filter = this.filter[value];
			item += `<div class="filterItem">${(isCsv)? filter : filter.label}</div>`;
		})
		let result = `<div class="tip_txt">Filter</div>${item}`
		return result;
	}


	// 정렬버튼
	async createSortButton() {
		let item = "";
		this.sort.forEach((value, index) => {
			let template = `
				<div class="menu-item ${(index === this.selectSortValue) ? MOD_CHECKED:""}" data-index="${index}">
					<span>${value.label}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
				</div>
			`
			item += template;
			if (index % 2) {
				let separator = `<div class="menu-separator"></div>`;
				item += separator;
			}
		});

		let result = `
		<div class="menu_container">				
			<button class="sortBtn clickable-icon nav-action-button" aria-label="정렬 순서 변경">
				<svg class="svg-icon lucide-sort" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
				<!-- 모달창 -->
				<div class="sort_menu menu">${item}</div>
			</button>

		</div>
		`;
	return result;
	}
	// CSV 파일만 적용 (새 row 추가)
	async createNewFileAddButton() {
		let result = `<div class="clickable-icon nav-action-button addNewFileBtn" aria-label="새 노트">
						<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>
					</div>`;
		return result
	}

	async template() {
		return `
			${(this.input.header) ? await this.createHeader() : ""}
			<div class="pageDataRendererjs">
				<div>
					${await this.createSelect()}
					<div class="pagination_container">
						<button class="clickable-icon is-disabled pagination-prevBtn" disabled="true" aria-label="이전">&lt; Prev </button>
						<div class="pagination" aria-label="페이지 번호">
							${await this.createPagination()}
						</div>
						<button class="clickable-icon is-disabled pagination-nextBtn" disabled="true" aria-label="다음">Next &gt;</button>
					</div>
				</div>
				<div>
					${await this.createSearch()}
					${(this.filter.length !== 0) ? await this.createFilter():""}
					${(isCsv && !isMobile) ? await this.createNewFileAddButton():""}
					${await this.createSortButton()}
				</div>
			</div>
			${(this.filter.length !== 0) ? `<div class="useFilterItem"></div>`: ""}
			`;
	}

	/** table 생성 */
	async createQueryResult() {
		// 이전 테이블 제거
		dv.container.lastChild.remove();

		// 페이지 정렬
		let pages = this.pages;
		const selectSort = this.sort[this.selectSortValue];
		if (selectSort.type.includes("file")) {
			const fileType = selectSort.type.substring(selectSort.type.indexOf("file.") + 5, selectSort.type.length);
			pages = pages.sort((b) => b.file[fileType], selectSort.sort);
		} else {
			pages = pages.sort((b) => b[selectSort.type], selectSort.sort);
		}

		// 페이지 슬라이스
		const currentPageValue = (this.currentPage - 1) * this.selectedValue;
		const pagesSlice = pages.slice(currentPageValue, currentPageValue + this.selectedValue);

		let header = [];
		let rows = [];
		if (this.input.row) {
			header = this.input.row.replace(/ /g,"").split(",");
		} else {
			header.push("file.link", "created");
		}

		if (isCsv) {
			// CSV 파일일 경우
			rows = pagesSlice.map(async page => await this.processCsvRow(page, header));
		} else {
			// 일반 md 파일일 경우
			rows = pagesSlice.map(async page => await this.processMdRow(page, header));
		}

		rows = await Promise.all(rows);

		// 테이블 렌더링
		dv.table(header, rows);
	}
	
	// Get csv file row data
	async processCsvRow(page, rowArr) {
		let rowsValue = [];
		for (let row of rowArr) {
			const value = page[row];
			const file = String(value);
			if (file.includes(",") && file.includes("[[")) {
				// 다중 정보가 저장되어 있는 경우
				let result = [];
				const content = file.split(",");
				content.forEach((v) => this.checkForCSVFiles(v.trim(), v.trim(), result));
				rowsValue.push(result);
			} else {
				await this.checkForCSVFiles(file, value, rowsValue);
			}
		}
		return rowsValue;
	}
	
	async checkForCSVFiles(file, value, rowsValue) {
		const imgFormat = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".gif"];
		const musicFormat = [".mp3", ".wav", ".ogg"];
		
		if (!file.includes("<img") && file.includes("![[") && imgFormat.some((format) => file.includes(format))) {
			// 이미지 파일
			const fileName = file.substring(file.indexOf("![[") + 3, file.indexOf(file.includes("|")? "|" :"]]"));
			const fileRealLink = await this.getFileRealLink(fileName);
			
			if (file.includes("[![[") && file.includes("](")) {
				const link = file.substring(file.indexOf("](") + 2, file.indexOf(")"));

				rowsValue.push(`<a data-tooltip-position="top" aria-label="${link}" href="${link}" target="_blank" class="external-link"><img src="${fileRealLink}" loading="lazy">`);
			} else {
				rowsValue.push(`<span><img src="${fileRealLink}" loading="lazy"></span>`);
			}
		} else if (musicFormat.some((format) => file.includes(format))) {
			// 음악 파일
			const fileRealLink = await this.getFileRealLink(value.path);

			rowsValue.push(`<span alt="${value.path}" src="${value.path}" class="internal-embed media-embed audio-embed is-loaded"><audio controls="" controlslist="nodownload" src="${fileRealLink}"></audio></span>`);
		} else {
			rowsValue.push(value);
		}
	}
	
	// Get md file row data
	async processMdRow(page, rowArr) {
		let rowsValue = [];

		for(let row of rowArr) {
			let result = "";
			if (row.includes("file.")) {
				// dv의 file 변수 지원
				const fileType = row.replace("file.", "");
				switch(fileType) {
					case "tasks":
						const tasks = page.file.tasks;
						if (tasks.length !== 0) {
							const comppletedTasks = tasks.where(t => t.completed);
							const value = Math.round((comppletedTasks.length / tasks.length || 0) * 100);
							  
							result = `<progress value="${value}" max="100"></progress><span>${value}%</span>`
						}
						break;
					default:
						result = page.file[fileType];
						break;
				}
					
			} else if (row === "cover_url") {
				// cover_url
				let src = "";
				if (page.cover_url) {
					if (dv.value.isLink(page.cover_url)) {
						// 페이지 cover_url이 옵시디언 내부 이미지를 불러오는 방식이라면
						src = await this.getFileRealLink(page.cover_url.path);
					} else {
						// 페이지 cover_url이 웹 이미지를 불러오는 형식이라면
						src = page.cover_url;
					}
				} else {
					// page가 null인 경우, 문서 내부의 첫번째 이미지에서 불러오기
					const imgFormat = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".gif"];
					for (let item of page.file.outlinks.values) {
						if (imgFormat.some((format) => item.path.includes(format))) {
							src = await this.getFileRealLink(item.path);
							break;
						}
					};
				}

				if (src === "") {
					result = page.cover_url;
				} else {
					result = `<a data-tooltip-position="top" aria-label="${page.file.name}" data-href="${page.file.name}" href="${page.file.link.path}" class="internal-link" target="_blank" rel="noopener"><img src="${src}" loading="lazy">`;
				}
			} else {
				// page의 프로퍼티 출력
				if (page[row] !== undefined && page[row] !== null) {
					result = page[row];
				}
			}

			rowsValue.push(result);
		}
		return rowsValue;
	}
	
	async getFileRealLink(value) {
		try {			
			const realFile = app.metadataCache.getFirstLinkpathDest(value, "");
			if (realFile) {
				const resourcePath = app.vault.getResourcePath(realFile);
				return resourcePath;
			}
			return null
		} catch (error) {
			console.log(error, value);
		}
	}

}

// Manipulator Elements
class DataManipulator {
	constructor(dataRenderer) {
		this.dataRenderer = dataRenderer;
	}

	/** CSV 파일 수정 후 저장시 */
	async updateCSVdata(pages) {
		const selectSortValue = Number(this.dataRenderer.selectSortValue);
		let content = (selectSortValue === 0 ) ? pages.values.reverse() : pages.values;

		const fileName = this.dataRenderer.input.pages;
		const data = await this.multiSuggestDouble(pages, "CSV에 새로운 데이터를 추가합니다");
		if (data !== undefined) {
			const fs = require('fs').promises;
			content[content.length] = data;
			const file = await jsonToCSV(content);
			
			// Save file
			fs.writeFile(`${app.vault.adapter.basePath}/${fileName}`, '\ufeff' + file, { encoding:"utf-8" });
			
			if (selectSortValue === 0) {
				pages.value = pages.values.reverse();
			}
			this.handleSort(pages, selectSortValue);
		}
	}

	/** Pagination 업데이트 메서드 */
	async updatePagination() {
		const paginationContainer = dv.container.querySelector('.pagination');
		paginationContainer.innerHTML = await this.dataRenderer.createPagination();

		// pagination 이벤트 리스너
		dv.container.querySelectorAll(".pagination .page-item").forEach((value) => {
			value.addEventListener("click", (e) => this.handlePaginationButtonClick(e))
		});

		this.updatePaginationButtonState(dv.container.querySelector(".pagination-prevBtn"), this.dataRenderer.startButton, this.dataRenderer.MAX_BUTTONS_TO_SHOW, true);
		this.updatePaginationButtonState(dv.container.querySelector(".pagination-nextBtn"), this.dataRenderer.fullPagination, this.dataRenderer.endButton, false);
	}
	/** Update Pagination Button State */
	async updatePaginationButtonState(button, maxValue, comparisonValue, isPrevButton) {
		if ((isPrevButton && maxValue <= comparisonValue) ||(!isPrevButton && maxValue === comparisonValue)) {
			button.setAttribute("disabled", true);
			button.classList.add("is-disabled");
		} else {
			button.removeAttribute("disabled");
			button.classList.remove("is-disabled");
		}

	}
	
	// Event Handle
	/** Handle selectPageNum */
	async handleSelectPageNum(selectValue) {
		await this.dataRenderer.setSelectValue(selectValue);
		await this.dataRenderer.resetPages();
		await this.dataRenderer.createQueryResult();
		await this.updatePagination();
	}

	async handlePaginationButtonClick(e) {
		this.dataRenderer.setCurrentPage(Number(e.currentTarget.textContent));
		
		dv.container.querySelectorAll(".pagination .is-active").forEach((ele) => {
			ele.classList.remove(IS_ACTIVE);
		});
		e.currentTarget.classList.add(IS_ACTIVE);
		await this.dataRenderer.createQueryResult();
	}
	/** Handle Pagination Button Click */
	async handlePrevNextButtonClick(direction) {
		const startButton = Number(this.dataRenderer.startButton);
		const currentPage = Number(this.dataRenderer.currentPage);
		const MAX_BUTTONS_TO_SHOW = Number(this.dataRenderer.MAX_BUTTONS_TO_SHOW);
		const fullPagination = Number(this.dataRenderer.fullPagination);

		if (direction === "prev" && startButton > MAX_BUTTONS_TO_SHOW) {
			// Prev Btn
			this.dataRenderer.setCurrentPage(startButton - MAX_BUTTONS_TO_SHOW);
			this.dataRenderer.setStartButton(startButton - MAX_BUTTONS_TO_SHOW);
		} else if (direction === "next" && currentPage < fullPagination) {
			// Next Btn
			this.dataRenderer.setCurrentPage(startButton + MAX_BUTTONS_TO_SHOW);
			this.dataRenderer.setStartButton(startButton + MAX_BUTTONS_TO_SHOW);
		}

		await this.updatePagination();
		await this.dataRenderer.createQueryResult();
	}
	
	/** 검색 결과 랜더링 함수 */
	async searchPage(pages) {
		let search = "";
		// 검색어 가져오기
		search = dv.container.querySelector(".textSearch").value.toLowerCase();

		// 검색어가 비어있지 않은 경우에만 필터링 적용
		if (search.trim() !== "") {
			if(isCsv) {
				pages = pages.filter((b) => {
					let result = false;
					let header = this.dataRenderer.input.row.split(",");
					header.forEach((e) => {
						const value = String(b[String(e).trim()]);
						if (!value.includes("![[") && !value.includes("https://")) {
							result = result || value.toLowerCase().includes(search);
						}
					})
					return result;
				});
			} else {
				pages = pages.filter((b) => {
					const isIncludeFileName = String(b.file.name).toLowerCase().includes(search);
					const isIncludeFileAliases = b.file.aliases.some((value) => value.toLowerCase().includes(search))
					return isIncludeFileName || isIncludeFileAliases;
				});
			}
		}

		return pages;
	}
	/** 필터링 된 pages를 리턴하는 함수 */
	async filterPage(pages) {
		const selectFilterValue = this.dataRenderer.selectFilterValue;
		if (selectFilterValue.length !== 0) {
			
			pages = pages.filter((b) => {
				let result = true;
				selectFilterValue.forEach((index) => {
					const input = this.dataRenderer.filter;
					const filter = input[index];
					
					if (isCsv) {
						// csv인 경우
						const metadata = String(b.metadata).toLowerCase().trim();
						result = result && metadata.includes(filter);
					} else {
						// md 파일인 경우
						const target = (filter.target)? String(filter.target).toLowerCase().trim(): null;
						// target이 프로퍼티인 경우 target은 key, target_content는 value인 형태
						const targetValue = (filter.target_content) ? String(filter.target_content).toLowerCase().trim(): null;
						// filter type에 따라서 구분
						const isIncludeTarget = filter.target_isInclude === "true" || false;

						switch (filter.type) {
							// 프로퍼티의 tags만 고르는 경우
							case "tags":
								if (isIncludeTarget) {
									result = result && b.tags.includes(target);
								} else {
									result = result && !b.tags.includes(target);
								}
								break;
							// 프로퍼티를 고르는 경우
							case "property":
								const property = b[target];
								if (targetValue) {
									switch (dv.value.typeOf(property)) {
										case "date":
											if (targetValue.includes("~")) {
												// 기간 설정
												const dateDuration = targetValue.split("~");
												const firstDate = dv.date(dateDuration[0].trim());
	
												const lastDate = (dateDuration[1].includes("now"))? new Date(): dv.date(dateDuration[1].trim());
		
												result = result && firstDate <= property && lastDate >= property;
											} else {
												const date = dv.date(targetValue);
												result = result && (date - property) === 0;
											}
											break;
										case "array":
											result = result && property.includes(targetValue);
											break;
										default:
											result = result &&  String(property).toLowerCase() === String(targetValue).toLowerCase();
											break;
									}
								} else if (isIncludeTarget) {
									result = result && (property !== null && property !== undefined);
								} else {
									result = result && (property == null || property == undefined || property == "");
								}
								break;
							// file
							// 문서내부의 전체 tags를 고르는 경우
							case "file.tags":
								if (isIncludeTarget) {
									result = result && b.file.tags.values.includes(target);
								} else {
									result = result && !b.file.tags.values.includes(target);
								}
								break;
							case "file.name":
							case "file.aliases":
							case "file.link":
								const fileName = String(b.file.name).toLowerCase();
								const fileAliases = b.file.aliases.values;
								if (isIncludeTarget) {
									result = result && (fileName.includes(target.toLowerCase()) || fileAliases.some((value) => value.toLowerCase().includes(target.toLowerCase())));
								} else {
									result = result && (!fileName.includes(target.toLowerCase()) || !fileAliases.some((value) => value.toLowerCase().includes(target.toLowerCase())));
								}
								break;
							case "file.inlinks":
							case "file.outlinks":
								const type = filter.type.replace("file.", "").trim();
								const fileType = b.file[type].values;
								if (isIncludeTarget) {
									result = result && (fileType.length !== 0);
								} else {
									result = result && fileType.some((value) => String(value.path).toLowerCase().includes(target));
								}
								break;
							default:
								console.log("pageDataRenderer.js: 작성하신 필터 타입은 지원하지 않습니다.");
								break;
						}
					}
				})
				return result; 
			});
		}
		return pages;
	}

	async updateFilterItem() {
		const selectFilterValue = this.dataRenderer.selectFilterValue;

		// 클래스 추가
		const filteringMenuItem = dv.container.querySelectorAll(".filtering_menu > .menu-item");
		filteringMenuItem.forEach((item) => {
			const index = Number(item.dataset.index);
			if (item.classList.contains(MOD_CHECKED)) {
				item.classList.remove(MOD_CHECKED);
			}
			if (selectFilterValue.length === 0 && index === 0) {
				item.classList.add(MOD_CHECKED);
			} else if (selectFilterValue.some((value) => value === index )) {
				item.classList.add(MOD_CHECKED);
			}
		});

		// 사용중인 필터 아이템 표시
		const useFilterItem = dv.container.querySelector(".useFilterItem");
		if (selectFilterValue.length === 0) {
			useFilterItem.innerHTML = "";
		} else {
			const item = await this.dataRenderer.createUseFilterItem();
			useFilterItem.innerHTML = item;

			// 해당 필터 아이템을 클릭했을 경우 삭제
			dv.container.querySelectorAll(".filterItem").forEach(ele => {
				ele.addEventListener("click", (e) => {
					// 해당 필터 아이템 값 배열에서 삭제
					const deleteValue = this.dataRenderer.filter.findIndex((b) => (isCsv) ? b === ele.innerText : b.label === ele.innerText);
					const filterable = this.dataRenderer.selectFilterValue.filter((b) => b !== deleteValue);
					this.dataRenderer.setSelectFilterValue(filterable);
	
					// 필터 재실행
					this.handleFilter(this.dataRenderer.pageInitial);
				});
			});
		}
	}

	async handleSearch(pages) {
		// 적용된 필터가 있는 경우 필터 결과 내에서 검색
		if(this.dataRenderer.filter.length !== 0) {
			pages = await this.filterPage(pages);
		}

		// 검색
		const data = await this.searchPage(pages);

		this.dataRenderer.setPages(data);
		this.dataRenderer.resetPages();
		this.dataRenderer.createQueryResult();
		this.updatePagination();
	}
	
	async handleFilter(pages, ...index) {
		// 검색어가 있는 경우 검색 결과 내에서 필터링
		if (!isMobile && !this.dataRenderer.useSearchModal) {
			pages = await this.searchPage(pages);
		}

		if (index.length !== 0) {
			if (index[0] === 0) {
				this.dataRenderer.setSelectFilterValue([]);
			} else {
				// 중복된 값을 받지 않기 위해
				if (!this.dataRenderer.selectFilterValue.some((i) => i === index[0])) {
					this.dataRenderer.setSelectFilterValue([...this.dataRenderer.selectFilterValue, index[0]]);
				}
			}
		}

		// 필터링
		const data = await this.filterPage(pages);
		// 필터 아이템 업데이트
		this.updateFilterItem();

		this.dataRenderer.setPages(data);
		this.dataRenderer.resetPages();
		this.dataRenderer.createQueryResult();
		this.updatePagination();
	}

	async handleSort(pages, index) {
		// 검색어가 있는 경우 검색 결과 내에서 필터링
		pages = await this.searchPage(pages);
		// 적용된 필터가 있는 경우 필터 결과 내에서 검색
		if(this.dataRenderer.filter.length !== 0) {
			pages = await this.filterPage(pages);
		}
		// csv 파일인 경우
		if(isCsv && index !== Number(this.dataRenderer.selectSortValue)) {  
			pages.values = pages.values.reverse();
		}

		this.dataRenderer.setSelectSortValue(index);
		this.dataRenderer.setPages(pages);
		this.dataRenderer.resetPages();
		this.dataRenderer.createQueryResult();
		this.updatePagination();
	}

	// Modal
    // fuzzySuggest modal
    async fuzzySuggest(names, values) {
        const { FuzzySuggestModal } = obsidian
        let data = new Promise((resolve, reject) => {

            this.MySuggestModal = class extends FuzzySuggestModal {
                getItems() {
                    return values
                }
				getItemText(val) {
					return names[values.indexOf(val)]
				}
                onChooseItem(val, event) {
                    resolve(val)
                }
            }

            new this.MySuggestModal(app).open()
        })
        return data
    }

	/** 새로 추가되는 csv 데이터를 받기 위한 modal 창 */
	async multiSuggestDouble(pages, header) {
        const { Modal, Setting } = obsidian;
        let data = new Promise((resolve) => {

            this.MyPromptModal = class extends Modal {
                constructor(app) {
                    super(app);
                }
				onOpen() {
					const { contentEl } = this;
					contentEl.createEl("h1", { text: header });

					// 스타일 추가
					contentEl.createEl("style", {text: `
					input {
						width: 100%;
					}
					.setting-item textarea {
						width: 100%; 
						height: 100px;
					}
					`});

					this.result = {...pages.values[0]};
					for (let val of Object.keys(this.result)) {
						// value 값 초기화
						this.result[val] = "";
						// 세팅
						if (val === "설명" || val === "summary") {
							new Setting(contentEl)
								.setName(`${val}`)
								.addTextArea((text) => {
									text.onChange((value) => {
										this.result[val] = value;
									})
								})
						} else {
							new Setting(contentEl)
								.setName(`${val}`)
								.addText((text) => {
									text.onChange((value) => {
										this.result[val] = value;
									})
								})
						}
					}

					new Setting(contentEl).addButton((btn) => btn
						.setButtonText("Save")
						.setCta()
						.onClick(() => {
							resolve(this.result);
							this.close();
						}))

				}
				onClose() {
					const { contentEl } = this;
					contentEl.empty();
				}
			}
			
			new this.MyPromptModal(app).open();

        })
        return data
	}

	/** 모바일에서 필터 데이터 받을 경우 modal */
	async useFilterModal(item, pages) {
		let index = 0;
		if (isCsv) {
			const data = await this.fuzzySuggest(item, item);
			index = Number(item.findIndex((b) => b === data));
		} else {
			const label = item.map((b) => b.label);
			const data = await this.fuzzySuggest(label, item);
			index = Number(item.findIndex((b) => b.label === data.label));
		}
		this.handleFilter(pages, index);
	}

	/** 모바일에서 정렬 데이터 받을 경우 modal */
	async useSortModal(item, pages) {
		const label = item.map((b) => b.label);
		const data = await this.fuzzySuggest(label, item);
		const index = Number(item.findIndex((b) => b.label === data.label));
		this.handleSort(pages, index);
	}

	/** 모바일에서 검색 데이터 받을 경우 modal */
	async useSearchModal(pages) {
		// 적용된 필터가 있는 경우 필터 결과 내에서 검색
		if(this.dataRenderer.filter.length !== 0) {
			pages = await this.filterPage(pages);
		}
		const values = [{"file":{"name": "모두보기"}, "title":"모두보기"}, ...pages.values];
		const label = values.map((b) => (!isCsv)? b.file.name: b.title);
		const data = await this.fuzzySuggest(label, values);

		if (data.title !== "모두보기") {
			pages = pages.filter((b) => b === data);
		}

		this.dataRenderer.setPages(pages);
		this.dataRenderer.resetPages();
		this.dataRenderer.createQueryResult();
		this.updatePagination();
	}
}

// Run
try {
	// Pages
	const pages = (isCsv) ? await dv.io.csv(input.pages) : dv.pages(input.pages);

	// 클래스 인스턴스 생성
	const dataRenderer = new DataRenderer(input, pages);
	const dataManipulator = new DataManipulator(dataRenderer);

	// 테이블 생성 코드 실행
	// Create EL 
	dv.container.innerHTML = await dataRenderer.template();
	// Dummy element to get removed
	dv.el("div", "");

	// 필터선택되어 있는 경우 바로 필터 실행
	if(dataRenderer.filter.length !== 0 && dataRenderer.selectFilterValue.length != 0) {
		dataManipulator.handleFilter(pages);
	} else {
		// Create Table
		dataRenderer.createQueryResult();
	}


	// 공통 이벤트 리스너
	dv.container.querySelector(".pageDataRendererjs").addEventListener("click", (e) => e.preventDefault());
	
	// 페이지 수 이벤트 리스너
	dv.container.querySelector(".selectPageNum").addEventListener("change", (e) => dataManipulator.handleSelectPageNum(Number(e.target.value)));
	
	// 검색 이벤트 리스너
	if (isMobile || dataRenderer.useSearchModal) {
		const searchBtn = dv.container.querySelector(".searchBtn");
		searchBtn.addEventListener("click", (e) => {
			dataManipulator.useSearchModal(pages);
		});
	} else {
		if (dataRenderer.useSearchBtn) {
			const searchBtn = dv.container.querySelector(".searchBtn");
			searchBtn.addEventListener("click", (e) => {
				if(searchBtn.classList.contains(IS_ACTIVE)) {
					searchBtn.classList.remove(IS_ACTIVE);
				} else {
					searchBtn.classList.add(IS_ACTIVE);
					dv.container.querySelector(".textSearch").focus();
				}
			})
		}
		dv.container.querySelector(".textSearch").addEventListener("input", async (e) => {
			dataManipulator.handleSearch(pages);
		});
		dv.container.querySelector(".search-input-clear-button").addEventListener("click", async (e) => {
			dv.container.querySelector(".textSearch").value = null;
			dataManipulator.handleSearch(pages);
		});
	}

	// pagination 이벤트 리스너
	dv.container.querySelectorAll(".pagination button").forEach((value) => {
		value.addEventListener("click", (e) => dataManipulator.handlePaginationButtonClick(e))
	});

	// pagination prev / next Btn 이벤트 리스너
	const prevBtn = dv.container.querySelector(".pagination-prevBtn");
	const nextBtn  = dv.container.querySelector(".pagination-nextBtn");
	prevBtn.addEventListener("click", () => dataManipulator.handlePrevNextButtonClick("prev"));
	dataManipulator.updatePaginationButtonState(prevBtn, dataRenderer.startButton, dataRenderer.MAX_BUTTONS_TO_SHOW, true);
	nextBtn.addEventListener("click", () => dataManipulator.handlePrevNextButtonClick("next"));
	dataManipulator.updatePaginationButtonState(nextBtn, dataRenderer.fullPagination, dataRenderer.endButton, false);
	
	// 필터 이벤트 리스너
	if(dataRenderer.filter.length !== 0) {
		// 표시되는 필터 아이템 클릭시 콜아웃 코드가 보이지 않도록 
		dv.container.querySelector(".useFilterItem").addEventListener("click", (e) => e.preventDefault());

		const filterBtn = dv.container.querySelectorAll(".filteringBtn") 
		filterBtn.forEach((value) => {
			value.addEventListener("click", (e) => {
				if (dataRenderer.useFilterModal || isMobile) {
					// Modal로 데이터 받는 형식
					dataManipulator.useFilterModal(dataRenderer.filter, pages);
				} else {
					e.currentTarget.classList.toggle(Has_ACTIVE);
				}
			});
			value.addEventListener("blur", (e) => {
				value.classList.remove(Has_ACTIVE)
			})
		})

		dv.container.querySelectorAll(".filtering_menu > .menu-item").forEach((ele) => {
			ele.addEventListener("click", (e) => {
				if (ele.classList.contains(MOD_CHECKED)) {
					// 해당 필터 아이템 값 배열에서 삭제
					const deleteValue = dataRenderer.filter.findIndex((b) => (isCsv) ? b === ele.innerText : b.label === ele.innerText);
					const filterable = dataRenderer.selectFilterValue.filter((b) => b !== deleteValue);
					dataRenderer.setSelectFilterValue(filterable);

					// 필터 재실행
					dataManipulator.handleFilter(pages);
				} else {
					const index = Number(ele.dataset.index);
					dataManipulator.handleFilter(pages, index);
				}
			});
		});

	}

	// 정렬 이벤트 리스너
	const sortBtn = dv.container.querySelector(".sortBtn"); 
	sortBtn.addEventListener("click", (e) => {
		if (dataRenderer.useSortModal || isMobile) {
			// Modal로 데이터 받는 형식
			dataManipulator.useSortModal(dataRenderer.sort, pages);
		} else {
			e.currentTarget.classList.toggle(Has_ACTIVE);
		}		
	});
	sortBtn.addEventListener("blur", (e) => {
		sortBtn.classList.remove(Has_ACTIVE);
	})
	dv.container.querySelectorAll(".sort_menu > .menu-item").forEach((value) => {
		value.addEventListener("click", (e) => {
			const index = Number(value.dataset.index);
			// 선택된 아이템에 클래스 추가
			dv.container.querySelector(".sort_menu > .mod-checked").classList.remove(MOD_CHECKED);
			value.classList.add(MOD_CHECKED);
			
			// 일반 라벨 방식으로 데이터 받는 방식
			dataManipulator.handleSort(pages, index);
		});
	});

	// CSV 새 row 데이터 추가는 PC에서만 가능
	if (isCsv && !isMobile) {
		dv.container.querySelector(".addNewFileBtn").addEventListener("click", (e) => {
			dataManipulator.updateCSVdata(pages)
		});
	}

} catch (error) {
	dv.paragraph("!" + error.toString());
}



// Utils
/** 파일 확장자명 추출 */
async function GetFileIncludesCSV(filename) {
	const fileLen = filename.length;
	const lastDot = filename.lastIndexOf(".");
	const fileExt = String(filename).substring(lastDot, fileLen).toLowerCase();
	return fileExt.includes("csv");
}

/** Json 데이터 CSV 변환 */
async function jsonToCSV(json_data) {
	const separator = ",";
	
	// 1. json 데이터 취득
	let json_array;
	if(typeof json_data === "string") {
		// json데이터를 문자열(string)로 넣은 경우, JSON 배열 객체로 만들기 위해 아래 코드 사용
		json_array = JSON.parse(json_data);
	} else {
		json_array = json_data;
	}

	// 결과 저장용 변수 선언
	let result = "";

	// 3. 제목 추출: json_array의 첫번째 요소(객체)에서 제목(머릿글)으로 사용할 키값을 추출
	const titles = Object.keys(json_array[0]);

	
	// 4. CSV문자열에 제목 삽입: 각 제목은 컴마로 구분, 마지막 제목은 줄바꿈 추가
	titles.forEach((title, index)=>{
		result += ((index !== titles.length-1) ? `${title}${separator}` : `${title}\r\n`);
	});


	// 5. 내용 추출: json_array의 모든 요소를 순회하며 '내용' 추출
	json_array.forEach((content, index)=>{
		
		let row = ''; // 각 인덱스에 해당하는 '내용'을 담을 행
		let num = 0;
		for(let title in content){ // for in 문은 객체의 키값만 추출하여 순회함.
			// 행에 '내용' 할당: 각 내용 앞에 컴마를 삽입하여 구분, 첫번째 내용은 앞에 컴마X
			let data = content[title]
			if (data === null) {
				data = "";
			} else if (String(data).includes(separator)) {
				data = `"${data}"`;
			}
			data = String(data).replace(/\n/ig, "<br/>");

			row += ((num === 0) ? `${data}` : `${separator}${data}`);
			num++;
		}

		// CSV 문자열에 '내용' 행 삽입: 뒤에 줄바꿈(\r\n) 추가, 마지막 행은 줄바꿈X
		result += ((index !== json_array.length-1) ? `${row}\r\n`: `${row}`);
	})

	// 6. CSV 문자열 반환: 최종 결과물(string)
	return result;
}

