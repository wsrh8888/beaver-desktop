<template>
  <div class="login__content">
    <div class="login__left">
    </div>
    <div class="login__right">
      <div class="login__right__header">

      </div>
      <el-form class="login__right__content" :model="form" label-width="0px">
        <el-form-item :error="errors.phone">
          <el-input size="large" v-model="form.phone" placeholder="请输入手机号" @blur="validatePhone"></el-input>
        </el-form-item>
        <el-form-item :error="errors.password">
          <el-input size="large" v-model="form.password" placeholder="请输入密码" @blur="validatePassword" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :disabled="!isFormValid" class="btn__login" type="primary" @click="loginBtn">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login__right__footer">

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import Logger from "renderModule/utils/log";
import { loginApi } from "renderModule/api/user";
import { ElMessage } from 'element-plus';
import { MD5 } from 'crypto-js';

const logger = new Logger("App.vue");
export default defineComponent({
  setup() {
    const form = ref({
      phone: "",
      password: "",
    });

    const errors = ref({
      phone: "",
      password: "",
    });

    const isFormValid = computed(() => {
      return !errors.value.phone && !errors.value.password && form.value.phone && form.value.password;
    });

    onMounted(() => {
      logger.info("mounted");
    });

    const validatePhone = () => {
      if (!form.value.phone) {
        errors.value.phone = "请输入手机号";
      } else if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
        errors.value.phone = "请输入正确的手机号";
      } else {
        errors.value.phone = "";
      }
    };

    const validatePassword = () => {
      if (!form.value.password) {
        errors.value.password = "请输入密码";
      } else {
        errors.value.password = "";
      }
    };

    const loginBtn = () => {
      validatePhone();
      validatePassword();
      if (!isFormValid.value) {
        ElMessage({
          message: '请填写正确的手机号和密码',
          type: 'error'
        });
        return;
      }
      if (form.value.phone && form.value.password) {
        loginApi({
          phone: form.value.phone,
          password: MD5(form.value.password).toString(),
        }).then((res) => {
          if (res.code === 0) {
            logger.info("login success");
            electron.storeData("loginInfo",{
              userId: res.result.userId,
              token: res.result.token,
            });
            electron.openWindow("app");
          } else {
            logger.error("login failed");
            ElMessage({
              message: '登录失败',
              type: 'error'
            });
          }
        });
      } else {
        logger.warn("Phone and password are required for registration");
        ElMessage({
          message: '手机号和密码为必填项',
          type: 'warning'
        });
      }
    };

    return {
      form,
      errors,
      loginBtn,
      validatePhone,
      validatePassword,
      isFormValid
    };
  },
});
</script>

<style lang="less" scoped>
.login__content {
  height: 100%;
  display: flex;
  .login__left {
    width: 391px;
    height: 100%;
    background: #7c7676;
  }
  .login__right {
    flex: 1;
    padding: 20px;
    .login__right__header {
      height: 172px;
    }
    .login__right__content {
      width: 100%;
     .btn__login {
        width: 100%;
        height: 40px;
     }
    }
    // .login__right__footer {
    //   width: 100%;
    //   height: 100px;
    // }
  }
}
</style>
