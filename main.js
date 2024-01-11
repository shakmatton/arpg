const THREE = window.MINDAR.IMAGE.THREE

document.addEventListener("DOMContentLoaded", () => {

    const start = async() => {

        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: "./ARPGMan.mind"
        })
    
        const {scene, camera, renderer} = mindarThree

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

        await mindarThree.start()

        renderer.setAnimationLoop(() => {
            renderer.render(scene,camera)
        })
    
    }

    start()
    
})





