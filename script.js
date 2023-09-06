'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
//webapi's data will be recived in object format so only use obj instead map datastructure
// Data
//if you
const account1 = {
  owner: 'Mohamed ashif',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2023-05-26T17:01:17.194Z',
    '2023-09-05T23:36:17.929Z',
    '2023-09-01T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const account2 = {
  owner: 'Sriram',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Movements Generator
const formatMovementDates = function (date, locale) {
  const calsDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24))); //converts ms->days

  const daysPassed = calsDaysPassed(now, date); //now == new Date() which has already defined

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  //else
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const startLogOutTimer = function () {
  //5mins
  let cTime = 300;
  const timi = () => {
    const min = String(Math.trunc(cTime / 60)).padStart(2, 0);
    const sec = String(cTime % 60).padStart(2, 0);
    labelTimer.textContent = `${min} : ${sec}`;
    if (cTime === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get Started`;
      containerApp.style.opacity = 0;
    }
    cTime--;
  };
  timi();
  const timer = setInterval(timi, 1000);
  return timer;
};

const calcDisplayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);

    const formatMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${formatMovementDates(date, acc.locale)}</div>
      <div class="movements__value">${formatMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//username generator
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      //note here map is used
      .join('');
  });
};
createUserNames(accounts);

//total balance Generator

const calcPrintBal = function (acc) {
  acc.balance = acc.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

//summary Generator
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);
  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposite => (deposite * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const updateUI = function (acc) {
  calcDisplayMovements(acc);
  //display balance
  calcPrintBal(acc);
  //display summary
  calcDisplaySummary(acc);
};
//Event Handlers
let currentAccount, timer;
//Creating Dates for login
let now = new Date();

// const locale = navigator.language;

btnLogin.addEventListener('click', function (event) {
  event.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === +inputLoginPin.value) {
    //clear input fields pin and username and to remove focus
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    const lastName = currentAccount.owner.split(' ')[1];

    //display ui and welcome message
    labelWelcome.textContent = `Welcome Back , ${
      lastName?.replace(lastName[0], lastName[0].toUpperCase()) ||
      currentAccount.owner
    }`;
    //display movements
    containerApp.style.opacity = 100;

    //display Date
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getDate() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year} , ${hour}:${min}`;

    //configuration object
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      weekday: 'short',
    };

    //experiment with api
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //update ui
    updateUI(currentAccount);
  }
});

//Amount transfer
btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    amount < currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //doing transfer
    console.log(`Transfer Valid`);
    //send and receiving money
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //adding date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //update ui
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//loan Feature
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount / 10)
  ) {
    setTimeout(function () {
      //add Movement
      currentAccount.movements.push(loanAmount);
      //loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      //update UI
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

//close account
btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1); //removing an particular object
    labelWelcome.textContent = `Log in to get Started`;
    inputCloseUsername.value = '';
    inputClosePin.value = '';
    inputClosePin.blur();
    //hide ui
    containerApp.style.opacity = 0;
  }
});

//sort button
let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  calcDisplayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//1.Numbers are always decimals
// console.log(23 === 23.0);

// console.log(0.1 + 0.2);

// console.log(0.1 + 0.3 == 0.4);

// console.log(typeof (3 * '4'));
// console.log(+'23'); //type cohersion
// console.log(+'23x'); //Not a Number

// //parsing -> parse a number form a string
// // it is mainly to retrieve an CSS value
// console.log(`\n parseInt + parseFloat \n`);
// //check if value is integer and return the number if not return NAN
// //2 -> arguments str + radix (generally 10)
// console.log(Number.parseInt(`10rem`, 10));
// //string must be start with number
// //we can use to retrieve CSS value
// console.log(Number.parseInt(`px10`, 10));
// //wont work
// console.log(Number.parseInt('2.9rem'));
// //check if value is float
// console.log(Number.parseFloat('2.5px'));
// console.log(parseFloat('22.5px'));

// //check if value is NAN (Not a Number)
// //it returns Boolean
// console.log(`\n isNan \n`);
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(23 / 0));
// console.log(Number.isNaN(+{}));

// //check if value is number or not
// //it returns Boolean
// console.log(`\n Finite \n`);
// console.log(Number.isFinite(200));
// //string wont work
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));
// console.log(Number.isFinite(23 / 0));

// console.log(`\n isInt \n`);
// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0)); //true
// console.log(Number.isInteger(23.5));
// console.log(Number.isInteger(23 / 0));

// //#2
// //Math, round function
// console.log(`\n Math Round \n`);
// console.log(Math.sqrt(14));

// //can do type cohersion
// console.log(Math.max(5, 8, 9, 44, 1, 33));
// console.log(Math.max(5, 8, 9, '44', 1, 33));
// //does do parsing
// console.log(Math.max(5, 8, 9, '44px', 1, 33));
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// //rand
// console.log(Math.trunc(Math.random() * 6) + 1);
// //max min values between 10 - 20
// const randGen = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randGen(10, 20));

// //trunc -> backward in positive
// console.log(Math.trunc(27.5));

// //round -> nearest Integer
// //<0.5-> back >=0.5->forward
// console.log(Math.round(23.3));
// console.log(Math.round(23.9));
// console.log(Math.round(23.5));
// //ceil -> only forward
// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.6));

// //Floor -> backward like trunc in positive but forward in negative
// console.log(Math.floor(23.32));
// console.log(Math.floor(23.5));

// console.log(Math.trunc(-23.7));
// console.log(Math.floor(-23.5));
// console.log(`\n floor and trunc in negative \n`);

// //Rounding Decimals
// //toFixed will return the string not a number
// console.log((2.5).toFixed(0)); //>=.5 ->forward
// console.log((2.2).toFixed(3));
// console.log((2.75656654).toFixed(5));
// console.log(+(2.7646).toFixed(0));

// //3.Remainder Operator AKA Modulo used for every Nth time
// console.log(`\n Remainder operator \n`);
// console.log(5 % 2);
// console.log(Math.trunc(5 / 2));
// console.log(Math.trunc(19 / 3));
// console.log(910 % 2 === 0 ? `Even` : `Odd`);

// const isEven = val => val % 2 === 0;

// labelBalance.addEventListener('click', function () {
//   console.log([...document.querySelectorAll('.movements__row')]);
//   [...document.querySelectorAll('.movements__row')].forEach(function (ele, i) {
//     if (i % 2 === 0) ele.style.backgroundColor = 'lightpink';
//     if (i % 3 === 0) ele.style.backgroundColor = 'lightblue';
//   });
// });

// //4.Numeric seperator

// //underscore that we can place anywhere in number
// //it can improve readability
// const dia = 2874600000000000;
// console.log(dia);

// //wont work on console.log but helps programmers
// //it gives meaning
// const priceCents = 345_99;
// console.log(priceCents);

// const transFee1 = 15_00;
// const transFee2 = 1_500;
// console.log(transFee1, transFee2);

// //underscores are placed only bw the numbers
// //❌❌
// const PI = 3.1_45; //bad practice
// console.log(PI);

// //we should not use _ in string and for conversion
// //in type conversion Numeric seperators wont work
// console.log(Number('2545_551')); //NAN
// console.log(Number.parseInt('230_026'));
// //in above we will be getting the value only before the underscore

// //07 bigint
// /*
// numbers are stored in 64 bit
// Database can have numbers more than 64bit that is a problem
// to solve this -> BIGINT is used
// operators can work as usually when using bigint
// NOTE : BigInt !== Int
// Math operations wont work
// */
// console.log(2 ** 53 - 1);
// //biggest number that js can store
// console.log(Number.MAX_SAFE_INTEGER);
// //different value not expected
// console.log(2 ** 53 + 4);
// //bigint -> 2 ways
// console.log(654161684684684168468464684n);
// //use this for storing small number
// console.log(BigInt(654161684684684168468464684));
// console.log(1000n + 1000n);
// const num = 684646816516884864163n;
// const num1 = 23;
// console.log(num + BigInt(num1));
// console.log(15 == 15n); //true
// console.log(15 === 15n); //false
// console.log(typeof 186486n);
// //gives closest value
// console.log(17n / 4n);

// //8)Dates and time

// //create a date
// console.log(new Date()) //returns today date
// //4 ways we can create date

// //safe
// const now = new Date();
// console.log(now);
// //not safe
// console.log(new Date('April 21,2004')); //manually typing date

// //parsing string into date
// console.log(new Date(account1.movementsDates[0]));

// //month is zero based (JAN - 0) like Arrays
// //it has 7 arguments -> year - month - day - hour - min - sec - ms
// console.log(new Date(2027, 12, 48, 52, 12, 5));
// console.log(new Date(2025, 5, 12, 15, 21, 10));

// //auto - correction
// console.log(new Date(2027, 10, 33)); //November not have 33 so it will returns december - 3rd

// //working with dates
// console.log(new Date(0));
// //milliseconds -> date
// console.log(new Date(2 * 24 * 60 * 60 * 1000));

// //similar to arrays, Date constructor has Multiple Methods
// //working with dates
// console.log(`\nmethods`);
// const future = new Date(2027, 0, 23, 15, 23, 55, 681); //fixed date
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth()); //Zero based
// console.log(future.getDate());
// console.log(future.getDay()); //day of the week
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.getMilliseconds());

// //date -> string
// console.log(future.toISOString());

// console.log(future.getTime()); //date -> ms
// console.log(Date.now()); //returns current date in millisec
// future.setFullYear(2056); //sets year -> mutable
// console.log(future);

// const future = new Date(2033, 5, 21);
// console.log(+future);
// const opt = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'INR',
// };

// const num = 646811.23;
// console.log('US: ', new Intl.NumberFormat('en-US', opt).format(num));
// console.log('Germany: ', new Intl.NumberFormat('de-DE', opt).format(num));
// console.log('Syria: ', new Intl.NumberFormat('ar-SY', opt).format(num));

// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, opt).format(num)
// );

//Internationalization of Numbers
// const Num = 365520.25;

// const opt = {
//   //unit percent currency
//   style: 'currency',
//   unit: 'celsius', //it Will be Ignored Completely
//   currency: 'INR',
//   useGrouping: false,
// };
// console.log(`us:`, new Intl.NumberFormat('en-US', opt).format(Num));

//
