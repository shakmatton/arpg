import {CSS3DObject} from "./CSS3DRenderer.js"


const THREE = window.MINDAR.IMAGE.THREE

document.addEventListener("DOMContentLoaded", () => {

    const start = async() => {

        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: "./ARPGMan.mind"
        })
    
        const {scene, camera, renderer, cssScene, cssRenderer} = mindarThree

        const textureLoader = new THREE.TextureLoader()
        const texture = await textureLoader.load("./40yo.png")
    
        const geometry = new THREE.PlaneGeometry(1, 1)

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            //transparent: true,
            //opacity: 0.85
        })

        const plane = new THREE.Mesh(geometry, material)

        const anchor = mindarThree.addAnchor(0)
        anchor.group.add(plane)

        const obj = new CSS3DObject(document.querySelector("#ar-div"))

        const cssAnchor = mindarThree.addCSSAnchor(0)
        cssAnchor.group.add(obj)


        // In your main.js, find the first image element
        const arImage = document.getElementById("ar-image");
        arImage.classList.add("fade-in");


        await mindarThree.start()

        renderer.setAnimationLoop(() => {
            renderer.render(scene,camera)
            cssRenderer.render(cssScene, camera)

            // if (!arImage.classList.contains("faded")) {
            //     setTimeout(() => {
            //       arImage.classList.add("faded"); // Faded class adds "fade-in" to avoid redundant animation
            //     }, 500); // Adjust delay as needed
            //   }
        })
    
    }

    start()
    
})





