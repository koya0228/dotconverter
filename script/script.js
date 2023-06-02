'use strict';

(() => {
	const $ = (id) => document.getElementById(id);
	
	const dataObject = {
		imgObject: null,
		imgColorArray: [],
		dotColorArray: [],
		imgWidth: 0,
		imgHeight: 0,
		splitDotHeight: 16,
		flgImgLoading: 0,
	};

	// DOM構成時
	document.addEventListener('DOMContentLoaded', () => {
		tableResize();
		
		if(window.innerWidth <= 990){
			if(document.querySelectorAll('.left-container > #right-container').length <= 0){
				$('export-op').insertAdjacentHTML('beforeBegin', $('right-container').outerHTML);
			}
		} else {
			if(document.querySelectorAll('.left-container > #right-container').length > 0){
				document.querySelectorAll('.left-container > #right-container')[0].remove();
			}
		}
	});

	// リサイズ時
	window.addEventListener('resize', () => {
		tableResize();
		
		if(window.innerWidth <= 990){
			if(document.querySelectorAll('.left-container > #right-container').length <= 0){
				$('export-op').insertAdjacentHTML('beforeBegin', $('right-container').outerHTML);
			}
		} else {
			if(document.querySelectorAll('.left-container > #right-container').length > 0){
				document.querySelectorAll('.left-container > #right-container')[0].remove();
				createDotViewerFunc()
			}
		}
	})

	// tableエリア リサイズ
	function tableResize() {
		let outerWidth = $('right-container').clientWidth;
		let outerHeight = $('right-container').clientHeight;

		if(outerWidth * 0.95 > outerHeight * 0.95){
			$('dot-viewer-outer').style.height = '95%';
			$('dot-viewer-outer').style.maxHeight = '800px';
			$('dot-viewer-outer').style.width = 'auto';
			$('dot-viewer-outer').style.maxWidth = 'auto';
		} else{
			$('dot-viewer-outer').style.width = '95%';
			$('dot-viewer-outer').style.maxWidth = '800px';
			$('dot-viewer-outer').style.height = 'auto';
			$('dot-viewer-outer').style.maxHeight = 'auto';
		}
	}

	// ファイル export時
	const exportImage = () => {
		if(dataObject.dotColorArray.length != 0){
			let dotHeight = Math.round(dataObject.splitDotHeight);
			let dotWidth = Math.round((dataObject.imgWidth / dataObject.imgHeight)* dotHeight);
			
			let cArray = dataObject.dotColorArray;

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = dotWidth;
			canvas.height = dotHeight;

			for(let h=0; h<dotHeight; h++) {
				for(let w=0; w<dotWidth; w++) {
					ctx.fillStyle = `rgb(${cArray[h][w][0]}, ${cArray[h][w][1]}, ${cArray[h][w][2]})`;
					ctx.fillRect(w, h, 1, 1);
				}
			}

			canvas.toBlob((blob) => {
				const aTag = document.createElement('a');
				aTag.setAttribute('href', URL.createObjectURL(blob));
				aTag.target = '_blank';
				aTag.download = 'dotconverter.jpg';
				aTag.click();

				URL.revokeObjectURL(aTag.src);
			});
		}
	}

	// 文字列 export時
	const exportString = () => {
		if(dataObject.dotColorArray.length != 0){
			let tempStr = $('export-string').value;

			if(tempStr.length > 0){
				console.log('uiun')
				let dotHeight = Math.round(dataObject.splitDotHeight);
				let dotWidth = Math.round((dataObject.imgWidth / dataObject.imgHeight)* dotHeight);

				let cArray = dataObject.dotColorArray;

				let resStr = ''
				if(document.querySelector('.rgb-select[name="col-select"]').checked) {
					for(let h=0; h<dotHeight; h++){
						for(let w=0; w<dotWidth; w++){
							let subStr = tempStr;
							subStr = subStr.replace('${r}', cArray[h][w][0]);
							subStr = subStr.replace('${g}', cArray[h][w][1]);
							subStr = subStr.replace('${b}', cArray[h][w][2]);
							
							subStr = subStr.replace('${x}', w);
							subStr = subStr.replace('${y}', h);

							resStr += subStr
						}
					}
				}

				const blob = new Blob([resStr], { type: 'text/plain' });
				const aTag = document.createElement('a');
				aTag.setAttribute('href', URL.createObjectURL(blob));
				aTag.target = '_blank';
				aTag.download = 'dotconverter.txt';
				aTag.click();
				URL.revokeObjectURL(aTag.href);
			}
		}
	}

	
	// ドットのtable要素への描画
	const createDotViewer = () => {
		let dotHeight = Math.round(dataObject.splitDotHeight);
		let dotWidth = Math.round((dataObject.imgWidth / dataObject.imgHeight)* dotHeight);
		
		let dotViewerOuter = $('dot-viewer-outer');
		let dotPixcelSize = 0
		if(dotHeight > dotWidth) {
			dotPixcelSize = Math.floor(dotViewerOuter.clientHeight / dotHeight);
		} else {
			dotPixcelSize = Math.floor(dotViewerOuter.clientWidth / dotWidth);
		}
		
		// console.log(dotViewerOuter.clientHeight)

		
		let elemTable = $('dot-viewer');
		elemTable.innerHTML = '';
		for(let h=0; h<dotHeight; h++){
			let elemTr = document.createElement('tr');
			for(let w=0; w<dotWidth; w++){
				let elemTd = document.createElement('td');
				
				let r = Number(dataObject.dotColorArray[h][w][0]).toString(16).padStart(2, '0');
				let g = Number(dataObject.dotColorArray[h][w][1]).toString(16).padStart(2, '0');
				let b = Number(dataObject.dotColorArray[h][w][2]).toString(16).padStart(2, '0');
				elemTd.style = `background: #${r}${g}${b}`;
				
				elemTd.addEventListener('click', (e) => {
					let elem = e.target;
					$('color-win').style.background = `#${r}${g}${b}`;
					$('color-text').value = `#${r}${g}${b}`;
				})
				
				elemTd.style.width = dotPixcelSize + 'px';
				elemTd.style.height = dotPixcelSize + 'px';
				elemTr.appendChild(elemTd)
			}
			elemTable.appendChild(elemTr);
		}
		// console.log('end');
		$('loading-display').style.display = 'none';
		$('main').style.overflowY = 'scroll';
		dataObject.flgImgLoading = 0;
	};
	
	function createDotViewerFunc(){
		createDotViewer();
	}

	// ドット化した際の各pixelの色を作成
	const createDotColors = () => {
		if(dataObject.dotHeight <= 0 && dataObject.dotHeight > dataObject.imgHeight){
			console.log('size is over')
		} else {
			let colorDatas = dataObject.imgColorArray;
			
			dataObject.dotColorArray = [];
			
			let dotHeight = Math.round(dataObject.splitDotHeight);
			let dotWidth = Math.round((dataObject.imgWidth / dataObject.imgHeight)* dotHeight);
			
			console.log(dotHeight, dotWidth);
			// ドットサイズの表示
			$('dotsize').innerText = `(${dotWidth}, ${dotHeight})`
			
			let splitHeightArray = [];
			for(let i=1; i<=dotHeight; i++){
				splitHeightArray[i-1] = Math.round((dataObject.imgHeight / dotHeight)* i);
			}
			let splitWidthArray = [];
			for(let i=1; i<=dotWidth; i++){
				splitWidthArray[i-1] = Math.round((dataObject.imgWidth / dotWidth)* i);
			}

			// console.log(splitHeightArray)
			// console.log(splitWidthArray)
			
			for(let h=0; h<dotHeight; h++){
				dataObject.dotColorArray[h] = [];
				for(let w=0; w<dotWidth; w++){
					dataObject.dotColorArray[h][w] = [[], [], [], [0]];
				}
			}
			
			let cntH = 0;
			for(let h=0; h<dataObject.imgHeight; h++){
				let cntW = 0;
				for(let w=0; w<dataObject.imgWidth; w++){
					dataObject.dotColorArray[cntH][cntW][0] = Number(dataObject.dotColorArray[cntH][cntW][0]) + Number(colorDatas[h][w][0]) || Number(colorDatas[h][w][0]);
					dataObject.dotColorArray[cntH][cntW][1] = Number(dataObject.dotColorArray[cntH][cntW][1]) + Number(colorDatas[h][w][1]) || Number(colorDatas[h][w][1]);
					dataObject.dotColorArray[cntH][cntW][2] = Number(dataObject.dotColorArray[cntH][cntW][2]) + Number(colorDatas[h][w][2]) || Number(colorDatas[h][w][2]);
					
					dataObject.dotColorArray[cntH][cntW][3] = Number(dataObject.dotColorArray[cntH][cntW][3]) + 1;
					
					if(w + 1 == splitWidthArray[cntW]){
						cntW += 1;
					}
				}
				if(h + 1 == splitHeightArray[cntH]){
					cntH += 1;
				}
			}
			
			for(let h=0; h<dotHeight; h++){
				for(let w=0; w<dotWidth; w++){
					dataObject.dotColorArray[h][w][0] = Math.round(Number(dataObject.dotColorArray[h][w][0]) / Number(dataObject.dotColorArray[h][w][3]));
					dataObject.dotColorArray[h][w][1] = Math.round(Number(dataObject.dotColorArray[h][w][1]) / Number(dataObject.dotColorArray[h][w][3]));
					dataObject.dotColorArray[h][w][2] = Math.round(Number(dataObject.dotColorArray[h][w][2]) / Number(dataObject.dotColorArray[h][w][3]));
				}
			}

			// console.log(dataObject.dotColorArray);
			createDotViewer();
		}
	};

	// 読み込んだ画像の全pixelの色を取得
	const getImgColors = (context) => {
		let imgWidth = dataObject.imgWidth;
		let imgHeight = dataObject.imgHeight;
		
		for(let h=0; h<imgHeight; h++){
			let tmpArray = [];
			for(let w=0; w<imgWidth; w++){
				tmpArray[w] = context.getImageData(w, h, 1, 1).data;
			}
			dataObject.imgColorArray[h] = tmpArray;
		}
		
		createDotColors();
	};

	// 画像をcanvas要素へ変換
	const setImgCanvas = () => {
		let canvas = document.createElement('canvas');
		let ctx = canvas.getContext('2d');
		
		let img = document.createElement('img');
		img.src = dataObject.imgObject.src;

		dataObject.imgWidth = img.width;
		dataObject.imgHeight = img.height;
		canvas.width =img.width;
		canvas.height = img.height;
		
		let image = dataObject.imgObject;
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		
		img = null;
		
		// $('dotsize').innerText = `${img.height}`;
		getImgColors(ctx);
	};

	// 画像の読み込み
	$('input-img').addEventListener('change', (e) => {
		$('loading-display').style.display = 'block';
		$('main').style.overflowY = 'hidden';
		dataObject.flgImgLoading = 1;
		
		dataObject.imgObject = new Image();
		let imgFile = e.target.files[0];
		
		let fileReader = new FileReader();
		fileReader.onload = () => {
			dataObject.imgObject.src = fileReader.result;
		};
		fileReader.readAsDataURL(imgFile);
		fileReader.onloadend = () => {
			$('img-filename').innerText = imgFile.name;
			$('img-viewer').src = fileReader.result;
			setImgCanvas();
		};
	});

	// サイズ変更
	$('dot-height-size').addEventListener('change', () => {
		dataObject.splitDotHeight = $('dot-height-size').value;
		if(dataObject.dotColorArray.length != 0){
			$('loading-display').style.display = 'block';
			$('main').style.overflowY = 'hidden';
			dataObject.flgImgLoading = 1;

			console.log('oopo')
			createDotColors();
		}
	});
	$('dot-height-size').addEventListener('input', () => {
		console.log($('dot-height-size').value)
		if(dataObject.dotColorArray.length != 0){
			let inputNum = $('dot-height-size').value;
			if(inputNum <= 0 || inputNum.length <= 0){
				$('dot-height-size').value = 1;
			} else if(inputNum[0] == 0){
				$('dot-height-size').value = Number(inputNum)
			}
		} else {
			$('dot-height-size').value = 16;
		}
	});

	// jpg画像のexport
	$('export-jpg-btn').addEventListener('click', exportImage);

	$('txt-dl').addEventListener('click', exportString);
})();
