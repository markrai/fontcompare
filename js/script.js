let currentText = "Sample Text";
let currentSize = "50";
let currentSizeUnit = "px";

function dragOverHandler(event) {
    event.preventDefault();
    const dropZone = document.querySelector('body');
    dropZone.classList.add('dragging-over');
    
    // Check if overlay already exists
    if (!document.getElementById('dragOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'dragOverlay';
        overlay.innerText = "Drop your font files here";
        document.body.appendChild(overlay);
    }
}



function dragLeaveHandler(event) {
    event.preventDefault();
    const dropZone = document.querySelector('body');
    dropZone.classList.remove('dragging-over');
    const overlay = document.getElementById('dragOverlay');
    if (overlay) {
        overlay.remove();
    }
}


function openColorPicker(event) {
    event.preventDefault();

    const isFontColorPicker = event.shiftKey; // Hold Shift to open font color picker
    const colorPicker = isFontColorPicker
        ? document.getElementById('fontColorPicker')
        : document.getElementById('backgroundColorPicker');
    
    const pickerWidth = 200;
    const pickerHeight = 200;
    let posX = event.pageX;
    let posY = event.pageY;

    if (posX + pickerWidth > window.innerWidth) {
        posX -= pickerWidth;
    }
    if (posY + pickerHeight > window.innerHeight) {
        posY -= pickerHeight;
    }

    colorPicker.style.left = `${posX}px`;
    colorPicker.style.top = `${posY}px`;
    colorPicker.style.display = 'block';

    colorPicker.click();
}


document.getElementById('fontColorPicker').addEventListener('input', function (event) {
    document.querySelectorAll('.font-sample').forEach(sample => {
        sample.style.color = event.target.value;
    });
});



document.getElementById('backgroundColorPicker').addEventListener('input', function (event) {
    document.body.style.backgroundColor = event.target.value;
});

// Hide Color Pickers when user clicks outside them.
document.addEventListener('click', function (event) {
    const colorPickers = [document.getElementById('backgroundColorPicker'), document.getElementById('fontColorPicker')];
    colorPickers.forEach(colorPicker => {
        if (colorPicker.style.display === 'block' && !colorPicker.contains(event.target)) {
            colorPicker.style.display = 'none';
        }
    });
});




function loadFonts(event, filesource) {
    event.stopPropagation();
    event.preventDefault();

    const dropZone = document.querySelector('body');
    dropZone.classList.remove('dragging-over');

    const fontContainer = document.getElementById('fontSamples');
    const fontButton = document.getElementById('fontButton');
    const fontParams = document.getElementById('fontParams');
    const fontSize = document.getElementById('fontSize');

    fontContainer.innerHTML = '';

    fontParams.style.display = "flex";

    const files = (filesource == 'picker') ? Array.from(event.target.files) : Array.from(event.dataTransfer.files);
    const validExtensions = ['.ttf', '.otf'];

    files.forEach((file, index) => {
        const validExtensions = ['.ttf', '.otf'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
            alert(`Invalid file type: ${file.name}`);
            return;
        }
        

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert(`File too large: ${file.name}`);
            return;
        }
        

        const fontName = `CustomFont${index}`;
        const fontUrl = URL.createObjectURL(file);

        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont);

            const sampleContainer = document.createElement('div');
            sampleContainer.classList.add('font-sample-container');

            const fileNameDisplay = document.createElement('div');
            fileNameDisplay.classList.add('font-filename');
            fileNameDisplay.innerText = file.name;
            sampleContainer.appendChild(fileNameDisplay);

            const sample = document.createElement('div');
            sample.classList.add('font-sample');
            sample.style.fontFamily = fontName;
            sample.innerText = currentText;
            sample.style.fontSize = currentSize + currentSizeUnit;
            sampleContainer.appendChild(sample);

            fontContainer.appendChild(sampleContainer);
        }).catch((error) => {
            console.error(`Failed to load font ${file.name}:`, error);
            alert(`Failed to load font ${file.name}. Please ensure it's a valid font file.`);
        });
    });

    fontButton.innerText = `Choose Fonts (${files.length})`;

}


function updateText(text) {
    currentText = text;
    document.querySelectorAll('.font-sample').forEach(sample => {
        sample.innerText = currentText;
    });
}

function updateSize(size, unit, source = 'click') {
    currentSize = size;
    currentSizeUnit = unit;

    if (source == 'click') { //reset default step value if switching from mousewheel control to left click
        const picker = document.getElementById('fontSize');
        picker.setAttribute('step', '1');
    }

    const samples = document.getElementsByClassName('font-sample');
    for (let i = 0; i < samples.length; i++) {
        let sample = samples[i];
        sample.style.fontSize = size + unit;
    }

    const fontSizeLabel = document.querySelector('label[for=fontSize]');
    fontSizeLabel.textContent = (Number(size) > 2) ? Math.round(Number(size)) : size;
}

// Enable mousewheel control for range picker
function changeRangeWithMouseWheel(event, size, pickerID) {
    const picker = document.getElementById(pickerID);
    let stepValue = parseFloat(_changeGranularity(size, currentSize, pickerID)) || 1; // Default to 1 if undefined

    if (event.deltaY < 0) {
        picker.valueAsNumber += stepValue;
    } else {
        picker.valueAsNumber = Math.max(picker.min, picker.valueAsNumber - stepValue);
    }
    updateSize(picker.value, currentSizeUnit, 'wheel');

    event.preventDefault();
    event.stopPropagation();
}


// Helper - Change granularity of range picker
function _changeGranularity(newSize, previousSize, pickerID) {
    const picker = document.getElementById(pickerID);
    if (newSize < 2) {
        picker.setAttribute('step', '0.1');
        return 0.1;
    } else if (newSize > 2 && previousSize <= 2) {
        picker.setAttribute('step', '1');
        return 1;
    } else {
        return 1;
    }
}


