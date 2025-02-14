const $ = (exp) => document.querySelector(exp);

const container = $('.container');
const uploadFolderBtn = $('.upload_folder');
const uploadFileBtn = $('.upload_file');
const uploadFolderInput = $('#folder');
const uploadFileInput = $('#file');
const logoutBtn = $('.logout button');

// 이벤트 리스너 등록 

// 로그아웃
if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
        location.href = `${window.origin}/auth/logout`;
    });
}
 
uploadFolderBtn.addEventListener('click', () => {
    uploadFolderInput.click();
});
uploadFileBtn.addEventListener('click', () => {
    uploadFileInput.click();
});
uploadFileInput.addEventListener('change', showUploadModal);
uploadFolderInput.addEventListener('change', showUploadModal);



window.onload = function () {
    setEvent();
}

function showUploadModal() {
    let totalSize = 0;
    Object.values(this.files).forEach(el => {
        totalSize += el.size;
    });
    // 용량이 1기가 이상인 경우 제한 
    if (totalSize > Math.pow(1000, 3)) {
        return alert('파일 용량이 한도를 초과했습니다.')
    };
    totalSize = totalSize / (1024 * 1024);
    // 소수점 아래 네번째 자리에서 반올림
    let tmp = totalSize * 1000;
    if (tmp - parseInt(tmp) > 0.5) {
        totalSize = (parseInt(tmp) + 1) / 1000
    } else {
        totalSize = parseInt(tmp) / 1000
    };

    const modal = document.createElement('div');
    modal.classList.add('modal');
    const uploadContent = `
        <div class="upload">
            <h1>업로드 대기중..</h1>
            <ul class="upload-list">
            </ul>
            <div class="upload-button">
                <div class="size">업로드 용량: ${totalSize}mb</div>
                <button type="button" class="cancel">취소</button>
                <button type="button" class="submit">업로드</button>
            </div>
        </div>
     `
    modal.innerHTML = uploadContent;
    const list = modal.querySelector('.upload-list');
    Object.values(this.files).forEach(el => {
        const liTag = document.createElement('li');
        liTag.textContent = el.name
        list.appendChild(liTag);
    })
    const cancelButton = modal.querySelector('.cancel');
    cancelButton.addEventListener('click', cancelModal);
    const uploadButton = modal.querySelector('.submit');
    uploadButton.addEventListener('click', () => upload(this.files));
    container.appendChild(modal);
}

function cancelModal() {
    const modal = document.querySelector('.modal');
    modal.parentNode.removeChild(modal);
}

//   file/folder
async function upload(files) {
    console.log(files);
    const uploadBtnArea = document.querySelector('.upload-button');
    uploadBtnArea.innerHTML = ''
    const num = new Date().valueOf();
    try {
        let idx = 0;
        const list = document.querySelectorAll('.modal ul li');
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('num', num);
            // url,FormData,options 
            const res = await axios.post(`${window.origin}/s3/file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (!res.data.msg === 'uploaded') {
                alert('업로드 중 오류가 발생했습니다.');
            }
            const liTag = list[idx];
            const spanTag = document.createElement('span');
            spanTag.innerHTML = `<i class="fas fa-check"></i>`;
            liTag.appendChild(spanTag);
            console.log(idx);
            ++idx;
        }
        const msg = document.querySelector('.upload h1');
        msg.textContent = '업로드 완료';
        const acceptBtn = document.createElement('button');
        acceptBtn.classList.add('submit');
        acceptBtn.textContent = '확인';
        uploadBtnArea.appendChild(acceptBtn);
        acceptBtn.addEventListener('click', () => {
            // cancelModal();
            location.reload();
        })
    } catch (err) {
        console.log(err);
    }
}

const folders = document.querySelectorAll('.folder');
folders.forEach(el =>
    el.addEventListener('click', (e) => {
        const id = e.target.parentNode.querySelector('input').value;
        location.href = `${window.origin}/resource/folder?id=${id}`
    })
);
const files = document.querySelectorAll('.file');
files.forEach(el => {
    const restoreBtn = el.querySelector('.restore');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
            const id = e.target.parentNode.parentNode.querySelector('.h_1').value;
            const hasParentFolder = e.target.parentNode.parentNode.querySelector('.h_2').value;
            console.log('아이디',id);
            axios({
                url : `${window.origin}/resource/file?id=${id}&parent=${hasParentFolder}`,
                method: 'post',
                data : {
                    id : 2
                }
            })
            .then( _ =>{
                alert('복구되었습니다'); 
                location.reload();
            })
            .catch(err=>{
                alert(err); 
            })
         
        })
    }
        // 파일을 복구할 경우 만약 폴더가 통째로 삭제되었을 경우, 폴더 복원
    });



// location.href = `${window.origin}/경로`;


const setEvent = () => {
    const folders = document.querySelectorAll('.folder');
    folders.forEach(el => el.addEventListener('click', (e) => {
        const id = e.target.parentNode.querySelector('input').value;
        location.href = `${window.origin}/resource/folder?id=${id}`
    }));
    const files = document.querySelectorAll('.file');
    files.forEach(el => el.addEventListener('click', (e) => {
        const id = e.target.parentNode.querySelector('input').value;
        location.href = `${window.origin}/resource/file/${id}`
    }));

    const starBtns = document.querySelectorAll('.fol-btn-s');
    starBtns.forEach(el => el.addEventListener('click', (e) => {
        const id = e.target.parentNode.parentNode.querySelector('input').value;
        if (!id) {
            alert(id);
        }
        const star = e.target.querySelector('i');
        const isFavorateCategory = window.location.href.split('/').includes('favorites');
        if (star.classList.contains('checked')) {
            axios.post(`${window.origin}/resource/file/favorite?id=${id}`, {
                point: 0
            })
                .then(res => {
                    star.classList.remove('checked');
                    // 
                    if (isFavorateCategory) {
                        location.reload();
                    }
                });
        } else {
            axios.post(`${window.origin}/resource/file/favorite?id=${id}`, {
                point: 1
            })
                .then(res => {
                    star.classList.add('checked');
                });

        }
    }));
    const deleteBtns = document.querySelectorAll('.tsh');
    console.log(deleteBtns);
    deleteBtns.forEach(el => el.addEventListener('click', (e) => {
        console.log(e.target);
        const id = e.target.parentNode.parentNode.querySelector('input').value;
        console.log(id);
        console.log(e.target.classList)
        const _class = e.target.classList.contains('fld') ? 'folder' : 'file';
        axios({
            url: `${window.origin}/resource/?id=${id}&class=${_class}`,
            method: 'delete'
        })
            .then(res => {
                location.reload();
            })
            .catch(err => {
                console.log(err);
            })
    }))

}

// 검색기능 구현
const searchInput = $('.search input');
const favorateCategory = encodeURI(location.href).split('/').includes('favorites');

if(searchInput){
    searchInput.onkeyup = searchContent;
}
function searchContent () {
    axios({
        url: `${window.origin}/resource/?name=${this.value}&limit=15`,
        method: 'post',
    })
        .then(res => {
            // 붙여넣을 곳
            const contentsWrapper = $('.fol-c');
            // 파일, 폴더 데이터 받아옴
            const folders = res.data.folders;
            const files = res.data.files;
            // 내용물 초기화
            contentsWrapper.innerHTML = "";
            // 
            const div = document.createElement('div');
            div.classList.add('com');
            //
            folders.forEach(folder => {
                const div = document.createElement('div');
                div.classList.add('com');
                div.classList.add('folder');
                div.innerHTML =
                    ` 
            <div class="fol-b">
            <button class="tsh fld">
                <i class="fas fa-trash-alt"></i>
            </button>
            </div>
            <input type="hidden" value="${folder.id}">
            <img src="#">
            <h1>${folder.name}</h1>
            </div>
           `
                contentsWrapper.appendChild(div);
            });
            files.forEach(file => {
                const div = document.createElement('div');
                div.classList.add('com');
                div.classList.add('file');
                div.innerHTML = `
                <div class="fol-b">
                    <button class="fol-btn-s">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="tsh">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <input type="hidden" value="${file.id}">
                <img src="#">
                <h1>${file.name}</h1>
            `
                if (file.favorite) {
                    div.querySelector('.fa-star').classList.add('checked');
                }
                contentsWrapper.appendChild(div);
            });
            setEvent();
        })
        .catch(err => {
            console.log(err);
        })
}






