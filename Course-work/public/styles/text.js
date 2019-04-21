const APP_URL = "http://localhost:3000";


Vue.component('product-cart-component', { //компонент корзина
    props: ['basket_bought']
    , template: `
<div>	
<section class="shoppingGridRow" v-for="item in basket_bought">
  <div class="product">
    <img class="pictureProduct" :src="item.cover" alt="">
    <div class="productDetails">
       <h2 class="productName">{{ item.name }}</h2>
       <div class="productColor">
         <span class="productParam">Color:</span> Red
       </div>
       <div class="productSize">
         <span class="productParam">Size:</span> XII
       </div>
    </div>
  </div>
  <div class="productPrice">{{ item.currency }}{{ item.price }}</div>
  <div class="productQty">
     <input type="text" v-model = "item.quantity" >
  </div>
  <div class="productShipping">FREE</div>
  <div class="productSubtotal"> {{ item.currency }}{{ item.price * item.quantity}} </div>
  <div class="productAction">
     <button @click="handleDeleteClick(item)">x</button>
  </div>
</section>
</div>
`,
	methods: {
    handleDeleteClick(item) {
    this.$emit('ondelete', item);
    }
  }
});

Vue.component('search', { //компонент поиск
  template: `
    <div>
        <form class="searchWrap">
            <div class="searchBrowse"> Browse <i class="fas fa-caret-down"></i> </div>
            <input placeholder="Search for Item..." type="text" v-model="searchQuery">
            <button @click.prevent="handleSearchClick"> <i class="fas fa-search"></i> </button>
        </form>
    </div>
  `,
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: { //кнопка поиск 
    handleSearchClick() {
      this.$emit('onsearch', this.searchQuery);
	  $search = document.getElementById("search");    
	  $search.style.display = "block";
	  $bodySite = document.getElementById("bodySite");    
	  $bodySite.style.display = "none";
    }
  }
});


const app = new Vue({
	el: "#app",
	data: {
	products : [],
	basketBought : [],
	commentsList : [],
	searchQuery: "",
    display: "none",
    displayTwo: "block",
	total: 0,
    name: null,
    email: null,
    password: null,
    phone: null,
    country: null,
    errors: '',
	loginEmail: '',
    loginPassword: '',
	errorsLogin: '',
	nameComment: null,
    emailComment: null,
    messageComment: null,
	
	},
	mounted(){
		fetch(`${APP_URL}/products`)//отправка запроса на сервер, извлечение продуктов
		  .then((response) => response.json())
		  .then((items) => {
		   this.products = items;
		}),
        fetch(`${APP_URL}/cart`) //вывод содержимого корзины
         .then((response) => response.json())
         .then((result) => {
          this.basketBought = result.items;
          this.total = result.total; 
        }),
		fetch(`${APP_URL}/comments`) //вывод комментариев
		  .then((response) => response.json())
          .then((comments) => {this.commentsList = comments})
	},
	  computed: {
    filteredItems() {
      const regexp = new RegExp(this.searchQuery, 'i');
      return this.products.filter((item) => regexp.test(item.name))
    },
  },
	methods:{
         handleSearch(query) {
                this.searchQuery = query;
            },
         buyClick(item) { //покупка товара
            const cartItem = this.basketBought.find(cartItem => cartItem.id === item.id);
            if (cartItem) { //товар в карзине уже есть	
                fetch(`${APP_URL}/cart/${item.id}`, {
                method: "PATCH",
		        headers: {"Content-Type": "application/json"}, 
		        body: JSON.stringify({quantity: cartItem.quantity + 1}),
		        }).then((response) => response.json())
                  .then((result) => {
                  const itemIdx = this.basketBought.findIndex(cartItem => cartItem.id === item.id);
                  this.basketBought[itemIdx] = result;
                  Vue.set(this.basketBought, itemIdx, result.item);
		          this.total = result.total;
                  });
            } else {
                fetch(`${APP_URL}/cart`, { //добавление товара в корзину
                method: "POST",
		        headers: {"Content-Type": "application/json"},
		        body: JSON.stringify({...item, quantity: 1}),
		        }) .then((response) => response.json())
                   .then((result) => {
                   this.basketBought.push(result.item);
		           this.total = result.total;
                })
		      }
                if (this.basketBought.length == 0) {
                this.display = "block";
                this.displayTwo = "none";
                   }
	    },
        
		handleDeleteClick(item) { //удаление товара из карзины 
            if(item.quantity > 1) { //если одного товара больше чем 1 
                fetch(`${APP_URL}/cart/${item.id}`, {
                method: "PATCH",
		        headers: {"Content-Type": "application/json"}, 
		        body: JSON.stringify({quantity: item.quantity - 1}),
		        }).then((response) => response.json())
                  .then((result) => {
                   const itemIdx = this.basketBought.findIndex(cartItem => cartItem.id === item.id);
                   this.basketBought[itemIdx] = result;
                   Vue.set(this.basketBought, itemIdx, result.item);
		           this.total = result.total;
                   });
            }else {
                fetch(`${APP_URL}/cart/${item.id}`, { //полное удаление товара
                method: 'DELETE',
                })
                .then((response) => response.json())
                .then((result) => {
                this.basketBought = this.basketBought.filter((cartItem) => cartItem.id !== item.id);
                this.total = result.total;    
                })
		     }
        },
        
        goToCardClick() { //переход в корзину
            $bodySite = document.getElementById("bodySite");    
	        $bodySite.style.display = "none";
            $basket = document.getElementById("basket");    
	        $basket.style.display = "block";
        },
        
        checkRegisrt(e) { //регистрация
            e.preventDefault()
            const $registrForms = document.registr
            this.errors = ''
            if (!/[a-zA-Z]/.test(this.name) || !this.name) { //проверка имени пользователя
                this.errors += 'Имя должно состоять только из букв. '
            };

            if (!/^[a-zA-Z0-9.-_]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/.test(this.email)) { //проверка электронной почты
                this.errors += 'E-mail должен быть в формате mymail@mail.ru . '     
            };

            if (!/.{4,}/.test(this.password) || !this.password) { //проверка пароля
                this.errors += 'Пароль не может быть короче 4 символов.'
            };

            if (!this.errors) { //регистрация нового пользователя
                fetch(`${APP_URL}/accounts`, {
                        method: 'POST',
                        body: JSON.stringify({
                            name: this.name,
                            email: this.email,
                            password: this.password,
                            phone: this.phone,
                            country: this.country
                        }),
                        headers: {
                            'Content-type': 'application/json'
                        }
                    })
                    .then(res => {
                        if (res.status == 200) {
                            alert('Регистрация прошла успешно')
                        } else {
                            this.errors += `Пользователь с e-mail ${this.email} уже существует`
                        }
                })
            }
        },
		        checkLogin(event) { //авторизация
            this.errorsLogin = ''
            fetch(`${APP_URL}` + /login/ + this.loginEmail, {
                method: 'PATCH',
                body: JSON.stringify({
                    password: this.loginPassword,
                    email: this.loginEmail
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(res => {
                if (res.status == 403) {
                    this.errorsLogin += `Неверно указан логин или пароль`
					event.preventDefault()
                } else {
                    res.json()
                        .then(identity => {
                            localStorage.setItem('email', identity.email)
                            localStorage.setItem('cipher', identity.cipher)
						alert('Осуществлен вход в аккаунт')
						$dropDownlistTwo = document.getElementById("dropDownlistTwo");    
	        			$dropDownlistTwo.style.display = "none";
						$dropDownlist = document.getElementById("dropDownlist");    
	        			$dropDownlist.style.display = "block";
                        })
                }
            })
        },
		        logout() { //выход из аккаунта
            fetch(`${APP_URL}` + '/logout/' + localStorage.getItem('email'), {
                method: 'PATCH',
                body: JSON.stringify({ email: localStorage.getItem('email')}),
                headers: {'Content-type': 'application/json'}
            }).then( res => {
                localStorage.removeItem("email")
				$dropDownlistTwo = document.getElementById("dropDownlistTwo");    
	        	$dropDownlistTwo.style.display = "block";
				$dropDownlist = document.getElementById("dropDownlist");    
	        	$dropDownlist.style.display = "none";				
            })
        },
				send_comment(e) { //добавление комментария
            		e.preventDefault()
            		var dT = new Date()
            		fetch(`${APP_URL}` + '/comments/', {
                		method: 'POST',
                		body: JSON.stringify({
                    		name: this.nameComment,
                    		email: this.emailComment,
                    		message: this.messageComment,
                    		date: `${dT.getDate()}.${dT.getMonth()+1}.${dT.getFullYear()}`,
                		}),
                		headers: {'Content-type': 'application/json'}
            		})
						.then(res => { 
                			if (res.status == 200) {
						alert('Комментарий успешно добавлен')
						location.reload()
                		}
        			})
				}
			},
	})



