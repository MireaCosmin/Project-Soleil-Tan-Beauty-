//import dependintele
const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const multer = require("multer");


//definesc fisierul .env in care o sa bag lucrurile "secrete"
dotenv.config({ path: './.env' });

//creez aplicatia
const app = express();

const port = process.env.PORT || 5000

//realizez conexiunea la baza de date
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//definesc rolurile
const ROLE = {
    ADMIN: 'Admin',
    ANGAJAT: 'Angajat',
    CLIENT: 'Client'
}

//all environments

//nu stiu ce plm sunt astea
//ceva ca sa pot accesa fisierul de CSS oriunde in proiect
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

//ca sa folosim mai multe dependinte
app.use(express.urlencoded({ extended: false }))
    //app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
//app.use(bodyParser.json());

app.use(fileUpload());

//setari pentru frontend
app.set('view engine', 'ejs');

//set view files
app.set('views', path.join(__dirname, 'views'));

////////////////////////////////////////

//verificam conectarea la baza de date
db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
});

//////////////////////////////////////////////

//redirectionarile pe pagini ( tot ce e de forma get redirectioneaza )


////////////////////////////////////////
//O SINGURA FUNCTIE GET ALTFEL DA EROARE
////////////////////////////////////////

/*app.get("/", (req, res) => {
    res.render("index");
});*/

app.get('/', (req, res) => {
    // res.render('vizualizeazaCategorii');
    let sql = "SELECT * from imagini";
    let sql2 = "SELECT * from servicii";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        let query = db.query(sql2, (err, rows) => {
            if (err) throw err;

            res.render('index', {
                imagini_home: rows,
                servicii: rows
            });
        });
    });
});

app.get('/home-page', (req, res) => {
    res.render('home-page');
})

app.get('/galerie', (req, res) => {
    res.render('galerie');
})


app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/admin', (req, res) => {
    res.render('admin');
})

app.get('/angajat', (req, res) => {
    res.render('angajat');
})

app.get('/client', (req, res) => {
    res.render('client');
})

app.get('/adaugaCategorie', (req, res) => {
    res.render('adaugaCategorie');
})

app.get('/adaugaAngajat', (req, res) => {
    res.render('adaugaAngajat');
})

app.get('/adaugaServiciu', (req, res) => {
    let sql = "SELECT * from categorii";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        console.log(rows)
        return res.render('adaugaServiciu', {
            categorii: rows
        });
    })
});

app.get('/vizualizeazaCategorii', (req, res) => {
    // res.render('vizualizeazaCategorii');
    let sql = "SELECT * from categorii";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        res.render('vizualizeazaCategorii', {
            categorii: rows
        });
    });
});

app.get('/vizualizeazaAngajati', (req, res) => {
    // res.render('vizualizeazaCategorii');
    let sql = "SELECT * FROM angajati WHERE role = 'Angajat' ";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        res.render('vizualizeazaAngajati', {
            angajati: rows
        });
    });
});

app.get('/vizualizeazaServicii', (req, res) => {
    let sql = "SELECT * FROM servicii";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        res.render('vizualizeazaServicii', {
            servicii: rows
        });
    });
});



//redirectionarea pe pagina de edit a angajatului X si preluarea datelor lui initiale
app.get('/modifica/:angajatId', (req, res) => {
    const angajatId = req.params.angajatId;
    let sql = `SELECT * FROM angajati WHERE id = ${angajatId}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('modificaAngajat', {
            angajat: result[0]
        });

    });
});


//functia de stergere a angajatilor asociata butonului de delete
app.get('/sterge/:angajatId', (req, res) => {
    const angajatId = req.params.angajatId;
    let sql = `DELETE FROM angajati WHERE id = ${angajatId}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/vizualizeazaAngajati');
    });
});

//functia de stergere a angajatilor asociata butonului de delete
app.get('/sterge/:serviciuId', (req, res) => {
    const serviciuId = req.params.serviciuId;
    let sql = `DELETE FROM servicii WHERE id = ${serviciuId}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/vizualizeazaServicii');
    });
});

//afisare servicii si angajati in dropdown-ul din formul de rezervari
app.get('/adaugaRezervare', (req, res) => {
    let sql = `SELECT * FROM servicii`;
    //let sql1 = "SELECT * FROM angajati";

    let query = db.query(sql, (err, rows) => {
        //if (err) throw err;
        //let query1 = db.query(sql1, (err, rows1) => {

        if (err) throw err;
        res.render('adaugaRezervare', {
            servicii: rows //,
                //angajati: rows1,


            // });
        })
    });
});

//uploadul de imagini
app.get("/incarcaImagine", (req, res) => {
    res.render("incarcaImagine");
});

//butonul de logout
app.get("/logout", (req, res) => {
    //req.logout();
    res.redirect('/');
});


//rezervarile angajatilor 
app.get('/rezervariAngajat', (req, res) => {
    const angajatName = req.params.angajatName;
    let sql = "SELECT * FROM rezervari ";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        res.render('rezervariAngajat', {
            rezervari: rows
        });
    });
});

app.get('/vizualizeazaImagini', (req, res) => {
    // res.render('vizualizeazaCategorii');
    let sql = "SELECT * from imagini";
    let query = db.query(sql, (err, rows) => {
        if (err) throw err;
        res.render('vizualizeazaImagini', {
            imagini: rows
        });
    });
});



////////////////////////////////////////

//realizarea functiilor de tip post

///////////////////////////////////////


//functia de register pentru clienti
app.post('/register', (req, res) => {
    console.log(req.body);

    //preiau date din formul de register
    //const name = req.body.name;
    //const email = req.body.email;
    //const password = req.body.password;
    //const passwordConfirm = req.body.passwordConfirm;

    //acelasi lucru ca mai sus poate fi scris si asa:
    const { name, email, password, passwordConfirm, phone } = req.body;
    const role = ROLE.CLIENT;


    db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }

        //verificam daca mailul nu a mai fost inregistrat si in caz negativ afisam un mesaj de atentionare
        if (results.length > 0) {
            return res.render('register', {
                message: 'This email is already in use'
            })
        }

        //verificam ca parola sa coincida cu confirmarea ei
        else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Password do not match'
            })
        }

        //criptarea parolei
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        //introducem un user nou in tabel
        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword, phone: phone, role: role }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered'
                });
            }

        });

    });
})

///////////////////////////////////

//functia de login
app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        //verificam daca s-au completat emailul si parola
        if (!email || !password) {
            return res.status(400).render('login', {
                //message: 'Please provide an email and password'
            })
        }

        //verificam daca datele introduse se regasesc in baza de date
        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, results) => {
            console.log(results);
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    // message: 'Email or Password is incorrect'
                })
            }

            //realizat logarea
            else {
                //variabila care retine rolul pentru a redirectiona pe pagina care trebuie
                const role = results[0].role;

                const id = results[0].id;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);

                //verific rolul si redirectionez pe pagina care trebuie
                if (role === ROLE.ADMIN)
                    res.status(200).redirect("/admin");
                else if (role === ROLE.ANGAJAT)
                    res.status(200).redirect("/angajat");
                else if (role === ROLE.CLIENT)
                    res.status(200).redirect("/client");
            }

        })

    } catch (error) {
        console.log(error);

    }

})

///////////////////////////////////

//functie de adaugat categorii
app.post('/adaugaCategorie', (req, res) => {
    console.log(req.body);
    //res.send("Angajat adaugat")

    //preiau date din formul de register
    const name = req.body.name;

    db.query('SELECT nume FROM categorii WHERE nume = ?', [name], async(error, results) => {
        if (error) {
            console.log(error);
        }

        //verificam daca mailul nu a mai fost inregistrat si in caz negativ afisam un mesaj de atentionare
        if (results.length > 0) {
            return res.render('adaugaCategorie', {
                message: 'This category is already in use'
            })
        }


        //introducem un user nou in tabel
        db.query('INSERT INTO categorii SET ?', { nume: name }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('adaugaCategorie', {
                    message: 'Category registered'
                });
            }

        });

    });


    //ca sa afisez in frontend
    //res.send("Form submitted")
});

//////////////////////////////////

//functie care adauga angajat
app.post('/adaugaAngajat', (req, res) => {
    console.log(req.body);
    //res.send("Angajat adaugat")

    //preiau date din formul de register
    const name = req.body.name_angajat;
    const email = req.body.email_angajat;
    const password = req.body.password_angajat;
    const passwordConfirm = req.body.passwordConfirm_angajat;
    const phone = req.body.phone_angajat;
    const department = req.body.department;

    //acelasi lucru ca mai sus poate fi scris si asa:
    //const { name, email, password, passwordConfirm, phone } = req.body;
    const role = ROLE.ANGAJAT;


    db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }

        //verificam daca mailul nu a mai fost inregistrat si in caz negativ afisam un mesaj de atentionare
        if (results.length > 0) {
            return res.render('adaugaAngajat', {
                message: 'This email is already in use'
            })
        }

        //verificam ca parola sa coincida cu confirmarea ei
        else if (password !== passwordConfirm) {
            return res.render('adaugaAngajat', {
                message: 'Password do not match'
            })
        }

        //criptarea parolei
        let hashedPassword_angajat = await bcrypt.hash(password, 8);
        console.log(hashedPassword_angajat);

        //introducem un user nou in tabel
        db.query('INSERT INTO angajati SET ?', { name: name, email: email, password: hashedPassword_angajat, phone: phone, role: role, department: department }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.redirect('vizualizeazaAngajati');
            }
        });

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword_angajat, phone: phone, role: role }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('vizualizeazaAngajati', {
                    message: 'Employee registered'
                });
            }
        });


    });
    //ca sa afisez in frontend
    //res.send("Form submitted")
});

/////////////////////////////////

//functia adaugare servicii
app.post('/adaugaServiciu', (req, res) => {
    console.log(req.body);

    //preiau date din formul de register
    //const name = req.body.name;
    //const email = req.body.email;
    //const password = req.body.password;
    //const passwordConfirm = req.body.passwordConfirm;

    //acelasi lucru ca mai sus poate fi scris si asa:
    const { nume, durata, pret, categorie } = req.body;


    db.query('SELECT nume FROM servicii WHERE nume = ?', [nume], async(error, results) => {
        if (error) {
            console.log(error);
        }

        //verificam daca numele nu a mai fost inregistrat si in caz negativ afisam un mesaj de atentionare
        if (results.length > 0) {
            return res.render('adaugaServiciu', {
                message: 'This service is already in use'
            })
        }

        //introducem un serviciu nou in tabel
        db.query('INSERT INTO servicii SET ?', { nume: nume, durata: durata, pret: pret, categorie: categorie }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('adaugaServiciu', {
                    message: 'Service registered'
                });
            }

        });

    });
})

/////////////////////////////////

//functia editare angajati
app.post('/modificaAngajat', (req, res) => {
    console.log(req.body);

    const userId = req.body.id;

    //introducem modificarile in tabel
    let sql = "UPDATE angajati SET name='" + req.body.name + "', email='" + req.body.email + "', phone='" + req.body.phone + "', role='" + req.body.role + "', department='" + req.body.department + "' where id = " + userId;

    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.redirect('/vizualizeazaAngajati');
    });

});


//functia adaugare rezervari
app.post('/adaugaRezervare', (req, res) => {
    console.log(req.body);

    const { serviciu, data, angajat, ora_inceput } = req.body;



    db.query('SELECT data, angajat, ora_inceput FROM rezervari WHERE data = ? AND angajat = ? AND ora_inceput = ?', [data, angajat, ora_inceput], async(error, results) => {
        if (error) {
            console.log(error);
        }

        //verificam daca numele nu a mai fost inregistrat si in caz negativ afisam un mesaj de atentionare
        if (results.length > 0) {
            return res.render('adaugaRezervare', {
                message: 'This reservation is already in use'
            })
        }
        db.query("SELECT * FROM servicii WHERE nume = ? ", [serviciu], async(error, results) => {
            if (error) {
                console.log(error)
            } else {
                let durata = results[0].durata;
                console.log("Durata este de " + results[0].durata + " minute.");
                let pret = results[0].pret;
                console.log("Pretul este de " + results[0].pret + " lei");
                let ora_sf = sum(ora_inceput, durata);
                console.log("Ora de final: " + ora_sf);




                //introducem un reservation nou in tabel
                db.query('INSERT INTO rezervari SET ?', { serviciu: serviciu, data: data, angajat: "Eu", ora_inceput: ora_inceput, pret: pret, ora_sfarsit: ora_inceput }, (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(results);
                        return res.render('adaugaRezervare', {
                            message: 'Service registered'
                        });
                    }

                });
            }
        });

    });
})

//functia de adaugare imagini

app.post('/incarcaImagine', (req, res) => {
    message = '';

    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    var file = req.files.uploaded_image;
    var img_name = file.name;

    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

        file.mv('public/imagini/' + file.name, function(err) {

            if (err)

                return res.status(500).send(err);
            var sql = "INSERT INTO `imagini`(`poza`) VALUES ('" + img_name + "')";

            var query = db.query(sql, function(err, result) {
                message = "Imagine incarcata";
                res.render('incarcaImagine', { message: message });
            });
        });
    } else {
        message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
        res.render('incarcaImagine', { message: message });
    }
});


/////////////////////////////////

//Functia de delete


////////////////////////////////

//setarea serverului aplicatiei
app.listen(port, () => {
    console.log(`Server started on Port ${port}`);
});



/////////////////////////////////
//Tema Criptografie si Securitate
/////////////////////////////////

/*

async function criptare() {

    const parola_initiala = "MireaCosmin1234"
    const parola_mea = "MireaCosmin123" //parola ce urmeaza sa fie criptata

    //criptarea parolei
    const parola_criptata = await bcrypt.hash(parola_mea, 12);

    console.log("Parola initiala: " + parola_initiala);
    console.log("Parola criptata: " + parola_criptata);

    //compararea parolei initiale cu cea criptata
    if (await bcrypt.compare(parola_initiala, parola_criptata))
        console.log("Cele 2 se potrivesc!")
    else
        console.log("Cele 2 nu se potrivesc!")

}

criptare(); //apelul functiei*/