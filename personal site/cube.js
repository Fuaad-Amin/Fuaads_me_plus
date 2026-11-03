(() => {

  const canvas = document.getElementById("cube-background");
  const ctx = canvas.getContext("2d");

  let width;
  let height;
  let dpr;


  function resizeCanvas() {

    dpr = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
      dpr, 0,
      0, dpr,
      0, 0
    );
  }


  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();



  /* ==============================================

            7 -------- 6
           /|         /|
          4 -------- 5 |
          | |        | |
          | 3 -------|-2
          |/         |/
          0 -------- 1
     ============================================== */

  const vertices = [

    [-1, -1, -1],  // 0
    [ 1, -1, -1],  // 1
    [ 1,  1, -1],  // 2
    [-1,  1, -1],  // 3

    [-1, -1,  1],  // 4
    [ 1, -1,  1],  // 5
    [ 1,  1,  1],  // 6
    [-1,  1,  1]   // 7

  ];

  const edges = [

    /* back square */
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    /* front square */
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    /* connecting edges */
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]

  ];



  // Rotation state

  let angleX = 35.264 * Math.PI / 180;
  let angleY = 45 * Math.PI / 180;
  let angleZ = 0;



  /*
      Current angular velocities.
      Units are radians / second.
  */

  let velocityX = 0.12;
  let velocityY = 0.18;
  let velocityZ = 0.08;



  /*
      The cube slowly moves toward these velocities.

      They periodically change to random values.
  */

  let targetX = velocityX;
  let targetY = velocityY;
  let targetZ = velocityZ;



  /* ==============================================
     RANDOM ROTATION
     ============================================== */

  let nextDirectionChange = 0;


  function chooseNewDirection(time) {

    /*
        Maximum spin speed.

        Increase this if you want more energetic
        movement.

        0.35 = fairly slow
        0.60 = noticeable
        1.00 = fast
    */

    const maxSpeed = 0.38;


    targetX =
      (Math.random() * 2 - 1) * maxSpeed;

    targetY =
      (Math.random() * 2 - 1) * maxSpeed;

    targetZ =
      (Math.random() * 2 - 1) * maxSpeed;

    //pick a direction every 5-10 seconds
    nextDirectionChange =
      time + 5000 + Math.random() * 5000;

  }

  //rotation matrix

  function rotationMatrix(x, y, z) {

    const cx = Math.cos(x);
    const sx = Math.sin(x);

    const cy = Math.cos(y);
    const sy = Math.sin(y);

    const cz = Math.cos(z);
    const sz = Math.sin(z);


    return [

      [
        cz * cy,
        cz * sy * sx - sz * cx,
        cz * sy * cx + sz * sx
      ],

      [
        sz * cy,
        sz * sy * sx + cz * cx,
        sz * sy * cx - cz * sx
      ],

      [
        -sy,
        cy * sx,
        cy * cx
      ]

    ];

  }



  // Matrix(vector)

  function rotatePoint(point, matrix) {

    const [x, y, z] = point;


    return [

      matrix[0][0] * x +
      matrix[0][1] * y +
      matrix[0][2] * z,


      matrix[1][0] * x +
      matrix[1][1] * y +
      matrix[1][2] * z,


      matrix[2][0] * x +
      matrix[2][1] * y +
      matrix[2][2] * z

    ];

  }
  function getSettings() {

    const styles =
      getComputedStyle(document.documentElement);


    const cubeSize =
      parseFloat(
        styles.getPropertyValue("--cube-size")
      );


    const thickness =
      parseFloat(
        styles.getPropertyValue("--edge-thickness")
      );


    const cubeColor =
      styles
        .getPropertyValue("--cube-color")
        .trim();


    return {
      cubeSize,
      thickness,
      cubeColor
    };

  }
  //ANIMATION

  let previousTime = performance.now();


  function animate(time) {

    requestAnimationFrame(animate);


    //Time snice previous frame

    let dt = (time - previousTime) / 1000;

    previousTime = time;

    //Choose new random direction

    if (time > nextDirectionChange) {

      chooseNewDirection(time);

    }
    
    //Smooth velocity interpolation
    //Larger smoothness means sharper rotations

    const smoothness = 0.7;
    const blend =
      1 - Math.exp(-smoothness * dt);


    velocityX +=
      (targetX - velocityX) * blend;

    velocityY +=
      (targetY - velocityY) * blend;

    velocityZ +=
      (targetZ - velocityZ) * blend;

    // Angle updates

    angleX += velocityX * dt;
    angleY += velocityY * dt;
    angleZ += velocityZ * dt;

    // Rotation Matrix Generation

    const matrix =
      rotationMatrix(
        angleX,
        angleY,
        angleZ
      );

    const {
      cubeSize,
      thickness,
      cubeColor
    } = getSettings();
        // vertices run from -1 → 1, so divide the desired cube side length by two.
    const scale = cubeSize / 2;
    //Rotate every vertex

    const rotatedVertices =
      vertices.map(vertex =>
        rotatePoint(vertex, matrix)
      );
    // Orthographic projection
    const centerX = width / 2;
    const centerY = height / 2;
    const projected =
      rotatedVertices.map(([x, y, z]) => ({
        x: centerX + x * scale,
        y: centerY + y * scale,
        z
      }));
    
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    ctx.strokeStyle = cubeColor;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const [a, b] of edges) {
      const p1 = projected[a];
      const p2 = projected[b];
      ctx.beginPath();
      ctx.moveTo(
        p1.x,
        p1.y
      );
      ctx.lineTo(
        p2.x,
        p2.y
      );
      ctx.stroke();
    }
  }
  chooseNewDirection(performance.now());
  requestAnimationFrame(animate);
})();