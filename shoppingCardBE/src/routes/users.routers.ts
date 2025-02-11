//_Một dự án có rất nhiều route. Ta tạo router users

//_import đến express để tạo route
import express from 'express'
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlwares'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/users.request'
import { wrapAsync } from '~/utils/handlers'

//_tạo user router
const userRouter = express.Router()

/*
    Description: Register a new user
    path: /register
    method: POST
    body: {
        name: string
        email: string
        password: string
        confirm_password: string
        date_of_birth: string nhung se la chuan ISO8601
    }
    Lưu ý: mình sẽ sử dụng checkSchema để kiểm tra dữ liệu thay thế cho 
    validationChain của công nghệ express-validator(bộ lọc lỗi của express)
    vì nếu mình xài validationChain nó sẽ bị cấu trúc liên hoàn và không trực quan
*/
userRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
 Description: Login
    path: users/login
    method: post
    body: {
        email: string
        password: string
    }
    
    sử dụng checkSchema để kiểm tra dữ liệu thay thế cho
    validationChain chấm liền hoàng như hồi nãy
*/
userRouter.post('/login', loginValidator, wrapAsync(loginController))

/*
    Desription: Logout
    path: users/logout
    method: post
    headers:{
        Authorization: 'Bearer <access_token>'
    }
    body:{
        refresh_token: string
    }
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*Dsc: khi người dùng đăng ký(register) thì mình tạo một cái link có kèm token xác thực và gửi vào mail cho họ
khi họ bấm vào thì mình nó sẽ đưa cái token lên cho mình thông qua query. Mình sẽ cầm cái đó và xác thực xem chuẩn không. nếu chuẩn thì verify cho người dùng 
    path: users/verify-email/?email_verify_token=string
          họ sẽ gửi email_verify_token lên cho mình thông qua query
    method: get: vì người dùng chỉ bấm vào thôi còn gửi gì lên thì mình đã soạn sẵn rồi
*/
userRouter.get('/verify-email/', verifyEmailTokenValidator, wrapAsync(verifyEmailTokenController))

/*Dsc: trường hợp khi người dùng đã vào được ứng dụng rồi nhưng chưa verify và muốn verify để có thể sử dụng nhiều tính năng hơn
path: users/resend-verify-email
method: post
headers: {
    Authorization: 'Bearer <access-token>'
}
**[chức năng này cần đăng nhập rồi sử dụng] vì khi đó mới có access để gửi lên hệ thống
*/
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*Description: khi người dùng đứng trên giao diện và bấm vào giao diện quên mật khẩu. Thì sẽ yêu cầu họ gửi email để thực hiện chức năng
    path: users/forgot-password
    method: post
*/
userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*Desc: kiểm tra xem forgot_password_token còn ok, còn sử dụng được hay không
    path: users/verify-forgot-password
    method: post
    body:{
        forgot_password_token: string
    }
*/
userRouter.post(
  '/verify-forgot-password',
  forgotPasswordTokenValidator, // hàm kiểm tra forgot-password-token
  wrapAsync(verifyForgotPasswordTokenController)
)

/*Desc: Sau khi kiểm tra verify token xong thì fe mới mở giao diện cho người dùng nhập sau đó gói 3 dữ
kiện đó và bắn cho be kiểm tra và reset password
    path: users/reset-password
    method: post,
    body: {
        password: string,
        confirm_password: string,
        forgot_password_token: string
    }
*/
userRouter.post(
  '/reset-password', //
  forgotPasswordTokenValidator, //điểm hay là mình đã có lưới lọc này rồi nên mình sẽ tách nhỏ ra và tận dụng chứ k cần viết lại
  resetPasswordValidator, //kiểm tra password, confirm_password
  wrapAsync(resetPasswordController)
)

/*Desc: chức năng giúp lấy profile về. 
[Lưu ý phải login mới sử dụng chức năng này được. Vì khi đó mình mới có access_token để sử dụng]
//_Lưu ý không lấy về thông tin quá nhạy cảm
    path: users/me
    method: post
    body: {
        headers: {
            Authorization: 'Bearer <access_token>'
        }
    }
*/
userRouter.post('/me', accessTokenValidator, wrapAsync(getMeController))

/*Desc: chức năng update profile
[Lưu ý chức năng này phải verify rồi mới cho update]
    path: users/me
    method: path
    body: {
        headers: {
            Authorization: 'Bearer <access_token>'
        }
        body: {
            name?: string
            date_of_birth?: Date
            bio?: string // optional
            location?: string // optional
            website?: string // optional
            username?: string // optional
            avatar?: string // optional
            cover_photo?: string // optional
        }
    }
*/
//_Mình update thì đã khống chế được username chuẩn
//tuy nhiên mình vẫn chưa có kiến trúc để bắt người ta khi truyền dư
//==> nên mình sẽ tạo ra một tầng lọc ràng buộc rằng dữ liệu trog req khi truyền lên thì chỉ lấy theo đúng mình thôi
//còn dư thì bỏ
userRouter.patch(
  '/me', //
  //nếu không có tầng lọc này khi user truyền lên dư sẽ dễ bị hack
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  accessTokenValidator,
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*Desc: ta sẽ tạo chức năng lấy profile bằng username
    path: users/:username
    method: get
    không cần header vì, chưa đăng nhập cũng có thể xem// Nghĩa là không cần accesstoken vẫn có thể xem được
        do mình đứng ở ngoài và vẫn có thể xem profile của người khác được
    *Thường thì gửi dữ liệu bằng param thì họ sẽ gửi userid để tìm kiếm các kiểu
    *Vì nếu gửi bậy bạ hoặc k gửi thì tìm k thấy nên mình cx k cần chặn
*/
userRouter.get('/:username', wrapAsync(getProfileController))

/*Desc: ta sẽ tạo chức năng changePassword. Chức năng này cần login vào thì mới cho thay đổi password[access_token]
    path: '/change-password'
    method: put
    headers: {
        Authorization: 'Bearer <access_token>'
    }
    body: {
        old_password: string, 
        password: string,
        confirm_password: string
    }
*/
userRouter.put(
  '/change-password', //
  accessTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/*Desc: refreshtoken
khi người dùng hết hạn access_token thì sẽ đem refresh_token gửi lên để xin lại access_token mới đồng thời cũng tạo refresh_token mới và lưu vào databse
    method: post [vì mình gửi lên là k cập nhật mà xóa cái cũ và thay cái mới luôn]
    path: users/refresh-token
    body: {
        refresh_token: string
    }
*/
userRouter.post(
  '/refresh-token', //
  refreshTokenValidator,
  wrapAsync(refreshTokenController)
)

export default userRouter

//*NOTE: nếu mình chỉ viết checkSchema thì nó vẫn sẽ lọc lỗi. Tuy nhiên có lỗi k valid gì
//thì nó sẽ không báo vì nó đang được lưu trong cuốn sổ lỗi. Mặc khác nó là RunnableValidationChain
//nên cần phải run(req) để thành ValidationChain và lỗi sẽ được lưu vào req đồng thời sẽ được khui bằng hàm
//validationResult()

//mặc khác nó sẽ không hợp lí vì nếu một middleware nằm sau controller thì cần phải theo đúng cấu trúc và cần có
//next() để qua các tầng lớp tiếp theo

//====> mình cần viết một hàm nhận vào checkSchema() chạy xong lấy lỗi và trả ra middleware. Vì vậy mình sẽ build
//và xây dựng nó bên utils để khi cần có thể lấy ngay tiện ích và sử dụng
