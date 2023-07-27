const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const Coupon = require("../models/couponModel")
const Order = require("../models/orderModel")

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken")
//token and refresfToken
const { genereteToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");

//isValidate
const validateMongoDbId = require("../utils/validateMongodbId");
const sendEmailer = require("./emailCtrl");

//crypto
const crypto = require("crypto")
//uniqid
const uniqid = require("uniqid");

//createUserController
const createUser = asyncHandler(async (req, res) => {

    const email = req.body.email;
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        //Creare new user
        const newUser = User.create(req.body)
        res.json(newUser)
    } else {
        // res.json({
        //     msg:"User Already Exists",
        //     success:false,
        // });

        throw new Error("User Already Exists")
    }
})

//loginController

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //check if user exixst or not
    const findUser = await User.findOne({ email })

    if (findUser && await findUser.isPasswordMatched(password)) {

        const refreshToken = generateRefreshToken(findUser?._id)
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 100,
        })

        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            //token: genereteToken(findUser?._id), // witth ecommerce app
            accessToken: genereteToken(findUser?._id), //with fabritech app
            refreshToken: refreshToken

        })
    } else {
        throw new Error("Invalid Credentials")
    }
})

//login Admin 
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist ot not 
    const findAdmin = await User.findOne({ email })
    if (findAdmin.role !== "Admin") throw new Error("Not Authorised")
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id)
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })

        console.log(findAdmin)

        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: genereteToken(findAdmin?._id), // with ecommerce
        });
    }
    else {
        throw new Error("Invalide Credentials")
    }

})

//handle refreshToken

const handleRefreshToken = asyncHandler(async (req, res) => {
    //-----FABRITECH--------------
    const { refresh } = req.body;

    //-----update - 19.06.2023
    const token = refresh
    console.log(token + "   token")
    const cookie = req?.cookies;
    console.log(cookie.refreshToken + "  cookie.token")

    if (!cookie?.refreshToken && token) throw new Error("No Refresh Token in Cookies")

    let refreshToken = cookie.refreshToken ? cookie.refreshToken : token;
    console.log(refreshToken + "  refreshToken")

    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No refreshToken present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token")
        }
        const accessToken = genereteToken(user?._id)
        res.json({ accessToken:accessToken })

    })
    //----------------ECOMMERCE--------------
    //     const cookie = req.cookies;
    //     console.log(cookie)
    //     if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    //     const refreshToken=cookie.refreshToken

    //     const user = await User.findOne({refreshToken});

    //     if(!user) throw new Error("No refreshToken present in db or not matched")
    //     jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
    //         if(err || user.id !== decoded.id){
    //             throw new Error("There is something wrong with refresh token")
    //         }
    //         const accessToken = genereteToken(user?._id)
    //         res.json({accessToken})
    //     })


})



//logout
const logout = asyncHandler(async (req, res) => {
    
    //ecommerce
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    const refreshToken = cookie.refreshToken;

    const user = await User.findOne({ refreshToken })

    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        })
        return res.sendStatus(204);
    }

    await User.findOneAndUpdate(refreshToken, {
        refreshToken: " ",
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    })
    res.sendStatus(204)
})


//update a user

const updatedUser = asyncHandler(async (req, res) => {
    // const {id}=req.params;
    const { _id } = req.user;
    validateMongoDbId(_id)
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile
            },
            {
                new: true,
            }
        );

        res.json(updatedUser)

    } catch (error) {
        throw new Error(error)
    }

})

//save user Address
const saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address
            },
            {
                new: true
            }
        );
        res.json(updateUser)
    } catch (error) {
        throw new Error(error)
    }
})

//getAllUsersController

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers)
    } catch (error) {
        throw new Error(error)
    }
})


//get a single user

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const getaUser = await User.findById(id)
        res.json({
            getaUser
        })
    } catch (error) {
        throw new Error(error)
    }
})

//delete a User

const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const deleteaUser = await User.findByIdAndDelete(id)
        res.json({
            deleteaUser
        })

    } catch (error) {
        throw new Error(error)
    }

})

//block user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true
            }
        );
        res.json({
            message: "User Blocked"
        })
    } catch (error) {
        throw new Error(error)
    }
})

//unblock user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id)
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true
            }
        );
        res.json({
            message: "User Unblock"
        })
    } catch (error) {
        throw new Error(error)
    }
})


//updatepassword
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { password } = req.body;
    validateMongoDbId(_id); // user controll

    const user = await User.findById(_id)
    if (password) {
        user.password = password;
        const updatePassword = await user.save();
        res.json(updatePassword)
    } else {
        res.json(user)
    }
})

//forgot password
const fotgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!email) throw new Error("User not found with this email")

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `hi, foolow this link to reset Password. This link is valid till 10 minutes from now. <a href="http://localhost:500/api/user/reset-password/${token}">Click<a/>`
        const data = {
            to: email,
            text: "Hey user",
            subject: "Forgot Password Link",
            htm: resetURL
        }
        sendEmailer(data)
        res.json(token)
    } catch (error) {
        throw new Error(error)
    }
})

//resetpassword
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) throw new Error("Token Expired, Please try again later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
})

//getWishlist
const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});


//user cart -shopping cart

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        let products = [];

        const user = await User.findById({ _id })
        const alreadyExistCart = await Cart.findOne({ orderby: user._id })

        if (alreadyExistCart) {
            alreadyExistCart.remove()
        }

        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color

            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object)
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += cartTotal + products[i].price * products[i].count;
        }
        console.log(products, cartTotal)
        const newCart = await Cart({
            products,
            cartTotal,
            orderby: user?._id
        }).save()
        res.json(newCart)
    } catch (error) {
        throw new Error(error)
    }
})

//get user cart
const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const cart = await Cart.findOne({ orderby: _id }).populate(
            "products.product"
        );
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
})

//remove cart
const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
        const user = await User.findOne({ _id })
        const cart = await Cart.findByIdAndRemove({ orderby: user._id })
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

//apply coupon

const applyCoupon = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    const validCoupon = await Coupon.findOne({ name: name });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon")
    }

    const user = await User.findOne({ _id })

    let { cartTotal } = await Cart.findOne({ orderby: user._id }).populate("products.product")


    let totalAfterDiscount = (
        cartTotal -
        (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);


    await Cart.findOneAndUpdate(
        { orderby: user._id },
        { totalAfterDiscount },
        { new: true }
    );

    res.json(totalAfterDiscount);
})


//create order 
const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body
    const { _id } = req.user
    validateMongoDbId(_id);

    try {
        if (!COD) throw new Error("Create cash order failed")
        const user = await User.findById(_id)
        let userCart = await Cart.findOne({ orderby: user._id })
        //console.log(userCart)
        let finalAmout = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmout = userCart.totalAfterDiscount;
        } else {
            finalAmout = userCart.cartTotal;
        }
        //console.log(finalAmout)

        let newOrder = await new Order({
            products: userCart.products,
            paymenIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmout,
                status: "Cashh on Delivery",
                create: Date.now(),
                currency: "usd",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery"
        }).save();
        //console.log(newOrder)
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } }
                }
            }
        })
        console.log(update)
        //create filter and update process then filter and update many process
        //[
        //{updateOne:{{filter:object,update:object}}}
        //{updateOne:{{filter:object,update:object}}}
        //]
        const updated = await Product.bulkWrite(update, {})
        res.json({ message: "success" })
    } catch (error) {
        throw new Error(error)
    }
})


//get All Order 
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const alluserorders = await Order.find()
            .populate("products.product")
            .populate("orderby")
            .exec();
        res.json(alluserorders)
    } catch (error) {
        throw new Error(error)
    }
})

//update order status 

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const updateOrdersStatus = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status
                }
            },
            {
                new: true
            }
        )
        res.json(updateOrdersStatus)
    } catch (error) {
        throw new Error(error)
    }
})





module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    fotgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    // getOrders,
    updateOrderStatus,
    getAllOrders

};