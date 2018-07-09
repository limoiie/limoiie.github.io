let imageFactory;

window.onload = function () {

    loadResource(application);

};

function loadResource (loaded_callback) {

    imageFactory = new ImageFactory();

    const nameUrls = [
        {
            name: 'cake',
            url: 'img/cake.png'
        }, {
            name: 'eiffel',
            url: 'img/eiffel.png'
        }, {
            name: 'heart',
            url: 'img/heart.png'
        }, {
            name: 'giftbox',
            url: 'img/giftbox.png'
        }, {
            name: 'flower',
            url: 'img/flower.png'
        }
    ];
    const audio = document.getElementById('bgMusic');
    const imgs = [];

    function load () {
        for (const i in nameUrls) {
            const pair = nameUrls[i];
            const image = new Image();
            image.onload = ()=>imageFactory.factory[pair.name]=image;
            image.onerror = ()=>imageFactory.error=true;
            image.src = pair.url;
            imgs.push(image);
        }
    }

    function checkLoaded() {
        let complete = true;
        imgs.forEach((img)=>{
            if (!img.complete) {
                complete = false;
            }
        });
        if (audio.readyState < 1) {
            complete = false;
        }

        if (!complete){
            setTimeout(checkLoaded, 1000);
        } else {
            loaded_callback();
        }
    }

    load();
    checkLoaded();

}

function application () {

    const framework = new FrameworkJS(document.getElementById('particles-canvas'));

    controllerSetting(framework);

    const anim = new ShapeShiftAnim(framework.ctx, {});
    framework.addAnim(anim);

    const karaokAnim = new KaraokAnim(framework.ctx, {});
    framework.addAnim(karaokAnim);

}

function controllerSetting(framework) {

    const toggle = document.querySelectorAll(".toggle")[0];
    const nav = document.querySelectorAll("nav")[0];
    const audio = document.getElementById('bgMusic');
    const loader = document.getElementById('loader');
    const toggle_open_text = 'Menu';
    const toggle_close_text = 'Close';
    const audio_playing = '<div>Music Off</div>';
    const audio_stopped = '<div>Music On</div>';

    let playing = false;
    let audioState = true;

    // hide loader and show the menu
    loader.classList.remove('loader');
    loader.classList.add('hide');
    nav.classList.remove('hide');
    nav.classList.remove('show-out');

    function close() {
        if (nav.classList.contains('open')) {
            nav.classList.remove('open');
        }
        if (playing) {
            nav.classList.remove('center');
            nav.classList.add('top-right');
        } else {
            nav.classList.add('center');
            nav.classList.remove('top-right');
        }
        toggle.innerHTML = toggle_open_text;
    }

    function onToggle () {
        nav.classList.toggle('open');
        if (playing) {
            nav.classList.remove('center');
            nav.classList.add('top-right');
        } else {
            nav.classList.add('center');
            nav.classList.remove('top-right');
        }
        if (nav.classList.contains('open')) {
            toggle.innerHTML = toggle_close_text;
        } else {
            toggle.innerHTML = toggle_open_text;
        }
    }

    function onMusic () {
        audio.classList.toggle('playing');
        if (audio.classList.contains('playing')) {
            musicBtn.innerHTML = audio_playing;
            playMusic();
            audioState = true;
        } else {
            musicBtn.innerHTML = audio_stopped;
            pauseMusic();
            audioState = false;
        }
        // audioState = !audioState;
    }

    function playMusic () {
        audio.play();
    }

    function replayMusic() {
        audio.load();
        audio.play();
    }

    function pauseMusic () {
        audio.pause();
    }

    function stopMusic () {
        audio.pause();
        audio.load();
    }

    toggle.addEventListener('click', onToggle, false);


    function exit () {

        playing = false;
        framework.stop();

        stopMusic();
        // onToggle();
        close();

    }

    // exit
    document.getElementsByClassName('l1')[0].addEventListener('click', function () {

        exit();

    });

    function replayMusicIfNeed () {

        if (audioState) {
            replayMusic();
        } else {
            stopMusic();
        }

    }

    // music on or off
    const musicBtn = document.getElementsByClassName('l2')[0];
    document.getElementsByClassName('l2')[0].addEventListener('click', onMusic);

    // auto play
    document.getElementsByClassName('l3')[0].addEventListener('click', function () {

        playing = true;
        framework.stop(()=>{
            replayMusicIfNeed();
            onToggle();

            framework.autoPlay(exit)
        });

    });

    // play
    document.getElementsByClassName('l4')[0].addEventListener('click', function () {

        playing = true;
        framework.stop(()=>{
            replayMusicIfNeed();
            onToggle();
            framework.start()
        });

    });

    onToggle();

}