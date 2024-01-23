import {CSS3DObject} from "./CSS3DRenderer.js"
import {loadGLTF} from "./loader.js" 


const THREE = window.MINDAR.IMAGE.THREE

document.addEventListener("DOMContentLoaded", () => {

    const start = async() => {

        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: "./ARPGMan.mind"
        })
    
        const {scene, camera, renderer, cssScene, cssRenderer} = mindarThree

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
        scene.add(light)

        

        /*   >>>>>>>   COUNTRYBALL  <<<<<<   */

        

        const cb = await loadGLTF("./Countryball/Countryball.gltf")

        cb.scene.scale.set(0.07, 0.07, 0.07)
        cb.scene.position.set(-0.38, -0.33, 0)
        // cb.scene.rotation.set(0, 9.5, 0)
        

        cb.scene.userData.clickable = true;          


        const cbAnchor = mindarThree.addAnchor(0)
        cbAnchor.group.add(cb.scene)

        const cbMixer = new THREE.AnimationMixer(cb.scene)
        const cbAction = cbMixer.clipAction(cb.animations[0])   
        cbAction.play()



        /*   >>>>>>>   AR IMAGE  <<<<<<   */



        const textureLoader = new THREE.TextureLoader()
        const texture40 = await textureLoader.load("./40yo.png")
        const texture35 = await textureLoader.load("./35yo.png")
    
        const geometry40 = new THREE.PlaneGeometry(1, 1)
        const geometry35 = new THREE.PlaneGeometry(1, 1)

        const material40 = new THREE.MeshBasicMaterial({
            map: texture40, // transparent: true, opacity: 0.85
        })

        const material35 = new THREE.MeshBasicMaterial({
            map: texture35, // transparent: true, opacity: 0.85
        })

        const plane40 = new THREE.Mesh(geometry40, material40)           // the 40yo guy
        const plane35 = new THREE.Mesh(geometry35, material35)           // the 35yo guy

        const ARPGAnchor = mindarThree.addAnchor(0)
        ARPGAnchor.group.add(plane40)
        ARPGAnchor.group.add(plane35)


        plane40.position.z = 0.00005      // 40yo guy is positioned a little bit ahead in front of 35yo guy (to avoid Z-Fighting).
        plane35.rotation.y = Math.PI      // 35yo guy starts backfacing the camera, back to back with the 40yo guy (which, in turn, is already facing the camera).



        /*   >>>>>>>   CSS DIVs  <<<<<<   */



        const footnote = new CSS3DObject(document.querySelector("#ar-footnote"))
        const headingARG = new CSS3DObject(document.querySelector("#ar-heading-arg"))
        const headingUSA = new CSS3DObject(document.querySelector("#ar-heading-usa"))

        const footnoteAnchor = mindarThree.addCSSAnchor(0)
        const headingARGAnchor = mindarThree.addCSSAnchor(0)
        const headingUSAAnchor = mindarThree.addCSSAnchor(0)

        footnoteAnchor.group.add(footnote)
        headingARGAnchor.group.add(headingARG)
        headingUSAAnchor.group.add(headingUSA)


        
/*      onTargetFound usage example:

        anchor.onTargetFound = () => {
            audio.play()   // the song is played when the raccoon is found (instead of when the app starts)
        }

        anchor.onTargetLost = () => {
            audio.pause()  // pause the song when the raccoon is lost.
        }
*/

        // In your main.js, find the first image element
        // const arImage = document.getElementById("ar-image");
        // arImage.classList.add("fade-in");


               
        /*   >>>>>>>   CLICK EVENT HANDLER  <<<<<<   */


        
        let cbRotation = 0                                      // Initial countryball rotation
        let cbTurn = 0                                          // Counter will assist CSS flags switching
        let planeTurn = 0                                       // A turn counter for 40yo and 30yo guys


        document.body.addEventListener("pointerdown", (e) => {
            
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);  
            const mouse = new THREE.Vector2(mouseX, mouseY);

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) { 
                let o = intersects[0].object         
                
                while (o.parent && !o.userData.clickable) {   
                    o = o.parent;                              
                }
            
                if (o.userData.clickable) {                  
                    if (o === cb.scene) {                 
                        cbRotation += Math.PI;                               // Countryball must now rotate 180 degrees
                        cb.scene.rotation.y = cbRotation;                    // Executes 180 degrees rotation    
                        cbTurn++                                             // Updates number of countryball turns
                    }
                }
            }
        });



        /*   >>>>>>>   CLOCKS & RENDERS  <<<<<<   */



        const clock = new THREE.Clock()

        await mindarThree.start()


        renderer.setAnimationLoop(() => {

            const delta = clock.getDelta()                      // delta -> Countryball original blender animation
            cbMixer.update(delta)

            const elapsedTime = clock.getElapsedTime()          // elapsedtime -> Countryball angular three.js animation
            const cbAngle = elapsedTime * 0.2            
            
            cb.scene.position.x = Math.cos(cbAngle) * 0.4
            cb.scene.position.y = Math.sin(cbAngle) * 0.4

            /* const ghost1Angle = elapsedTime * 0.5               // fixed radius
               ghost1.position.x = Math.cos(ghost1Angle) * 4    ghost1.position.z = Math.sin(ghost1Angle) * 4       ghost1.position.y = Math.sin(elapsedTime * 3)    */ 

            // cb.scene.rotation.y = cbRotation            
            

            if (cbTurn % 2 == 0) {                                  // this means the countryball will switch flags each time the number of turns is even or odd.   
                headingARG.element.style.visibility = "visible";    
                headingUSA.element.style.visibility = "hidden";    
                headingUSA.position.y = 99999;                      // this solves the z-buffer conflict between both css elements
                headingARG.position.y = 0;                          // when a css position is set to 0, it is displayed normally on screen.
                               
            } 
            else {
                headingUSA.element.style.visibility = "visible";   
                headingARG.element.style.visibility = "hidden";     
                headingARG.position.y = 99999;                      // when a css position is set to 99999, it is displayed far away (up and out of the camera display range). 
                headingUSA.position.y = 0;    
                 
            }

                                                                     // if Countryball rotates, both guys planes must rotate too. So, cbTurn and planeTurn must be equal.
            if (cbTurn !== planeTurn) {                              // If cbTurn and planeTurn are NOT equal:
                plane40.rotation.y = plane40.rotation.y + Math.PI    // ...40yo guy now rotates 180 degrees, facing opposite side of 35yo guy
                plane35.rotation.y = plane35.rotation.y + Math.PI    // ...35yo guy now rotates 180 degrees, facing opposite side of 40yo guy
                planeTurn++                                          // planeTurn now follows the counter of the Countryball cbTurn. Now they are equal.
            }

/*
            const angleThreshold = Math.PI;                 // Threshold for switching flags
            const isArgentinaFlagVisible = cbRotation < angleThreshold;
    
            headingARG.element.style.visibility = isArgentinaFlagVisible ? "visible" : "hidden";
            headingUSA.element.style.visibility = !isArgentinaFlagVisible ? "visible" : "hidden";

*/



            // IDEA: TRY TO DRAW A BLANK SCREEN (BLACK, WHITE, WHATEVER...) IN THE CASE OF THE EVENT "TARGETLOST"...
            
            


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