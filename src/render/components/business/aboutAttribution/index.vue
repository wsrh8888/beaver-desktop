<template>
  <div class="about-attribution">
    <div class="about-attribution__hero">
      <img src="commonModule/assets/img/logo/logo.png" alt="海狸 Logo" class="about-attribution__logo">
      <p class="about-attribution__demo-tag">
        署名示范
      </p>
      <h2 class="about-attribution__credit">
        本项目使用了开源项目
      </h2>
      <p class="about-attribution__brand">
        海狸 IM (Beaver IM)
      </p>
      <p class="about-attribution__version">
        当前桌面端版本 {{ currentVersion }}
      </p>
    </div>

    <section class="about-tip">
      <p class="about-tip__title">
        给二次开发者的说明
      </p>
      <p class="about-tip__text">
        上线部署时，请在前端「开源致谢 / 海狸署名」等独立署名页保留与下方同等显著的内容：写明「本项目使用了开源项目 海狸 IM (Beaver IM)」，并列出所用仓库地址。本页即为官方示范，请勿仅把版权藏在代码注释里。
      </p>
    </section>

    <section class="about-block">
      <h3 class="about-block__title">
        本项目使用的开源项目
      </h3>
      <p class="about-block__desc">
        以下仓库均属于海狸 IM 开源体系，点击可在浏览器打开：
      </p>
      <div class="about-repo-list">
        <button
          v-for="item in projectList"
          :key="item.github"
          type="button"
          class="about-repo-item"
          @click="openUrl(item.github)"
        >
          <div class="about-repo-item__main">
            <span class="about-repo-item__name">{{ item.name }}</span>
            <span class="about-repo-item__desc">{{ item.desc }}</span>
            <span class="about-repo-item__url">{{ item.github }}</span>
          </div>
          <span class="about-repo-item__arrow">打开</span>
        </button>
      </div>
      <p class="about-block__foot">
        主仓库推荐标注：
        <button type="button" class="about-attribution__inline-link" @click="openUrl(serverRepoUrl)">
          {{ serverRepoUrl }}
        </button>
      </p>
    </section>

    <section class="about-block about-block--license">
      <h3 class="about-block__title">
        版权与商业授权
      </h3>
      <ul class="about-license-points">
        <li>开源协议：<strong>MIT</strong>（仓库根目录 LICENSE 不得删除）</li>
        <li>闭源自用 / 二次开源：免费，须保留本页类署名</li>
        <li>去署名、闭源交付第三方、对外 SaaS：需采购商业授权</li>
      </ul>
      <div class="about-license-actions">
        <BeaverButton type="primary" @click="openUrl(licenseDocUrl)">
          查看版权与商业授权说明
        </BeaverButton>
        <BeaverButton @click="openUrl(legalDocUrl)">
          打开文档站社区页
        </BeaverButton>
      </div>
      <p class="about-block__contact">
        商业授权联系：
        <button type="button" class="about-attribution__inline-link" @click="openUrl(mailUrl)">
          751135385@qq.com
        </button>
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import { computed, defineComponent } from 'vue'

const SERVER_REPO_URL = 'https://github.com/wsrh8888/beaver-server'
const LICENSE_DOC_URL = 'https://wsrh8888.github.io/beaver-docs/community/license.html'
const LEGAL_DOC_URL = 'https://wsrh8888.github.io/beaver-docs/community/'
const MAIL_URL = 'mailto:751135385@qq.com'

export default defineComponent({
  name: 'AboutAttribution',
  components: {
    BeaverButton,
  },
  setup() {
    const currentVersion = computed(() => electron.app.version)

    const projectList = [
      { name: 'beaver-server', desc: '服务端微服务', github: 'https://github.com/wsrh8888/beaver-server' },
      { name: 'beaver-desktop', desc: '桌面端 Electron', github: 'https://github.com/wsrh8888/beaver-desktop' },
      { name: 'beaver-flutter', desc: '移动端 Flutter', github: 'https://github.com/wsrh8888/beaver-flutter' },
      { name: 'beaver-manager', desc: '后台管理系统', github: 'https://github.com/wsrh8888/beaver-manager' },
      { name: 'beaver-open', desc: '开放平台', github: 'https://github.com/wsrh8888/beaver-open' },
      { name: 'beaver-oauth', desc: 'OAuth 授权登录', github: 'https://github.com/wsrh8888/beaver-oauth' },
      { name: 'beaver-docs', desc: '官方文档站', github: 'https://github.com/wsrh8888/beaver-docs' },
    ]

    const openUrl = (url: string) => {
      void electron.workbench.openExternal({ url })
    }

    return {
      currentVersion,
      projectList,
      serverRepoUrl: SERVER_REPO_URL,
      licenseDocUrl: LICENSE_DOC_URL,
      legalDocUrl: LEGAL_DOC_URL,
      mailUrl: MAIL_URL,
      openUrl,
    }
  },
})
</script>

<style lang="less" scoped>
.about-attribution {
  max-width: 560px;
  margin: 0 auto;
  padding: 8px 0 40px;

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px 20px 32px;
    margin-bottom: 16px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255, 125, 69, 0.12) 0%, rgba(255, 125, 69, 0.03) 100%);
    border: 1px solid rgba(255, 125, 69, 0.22);
  }

  &__logo {
    width: 72px;
    height: 72px;
    margin-bottom: 14px;
  }

  &__demo-tag {
    margin: 0 0 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(255, 125, 69, 0.15);
    font-size: 12px;
    font-weight: 600;
    color: #FF7D45;
    line-height: 1.6;
  }

  &__credit {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 500;
    color: #636E72;
    line-height: 1.5;
  }

  &__brand {
    margin: 0 0 10px;
    font-size: 22px;
    font-weight: 700;
    color: #FF7D45;
    line-height: 1.3;
  }

  &__version {
    margin: 0;
    font-size: 13px;
    color: #B2BEC3;
  }

  &__inline-link {
    padding: 0;
    border: none;
    background: transparent;
    font-size: inherit;
    color: #FF7D45;
    cursor: pointer;
    word-break: break-all;

    &:hover {
      text-decoration: underline;
    }
  }
}

.about-tip {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #FFF8F4;
  border: 1px solid rgba(255, 125, 69, 0.2);

  &__title {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: #FF7D45;
  }

  &__text {
    margin: 0;
    font-size: 13px;
    color: #636E72;
    line-height: 1.7;
  }
}

.about-block {
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid #EBEEF5;
  border-radius: 12px;
  background: #FFFFFF;

  &--license {
    background: #F9FAFB;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  &__desc {
    margin: 0 0 14px;
    font-size: 13px;
    color: #636E72;
    line-height: 1.6;
  }

  &__foot {
    margin: 14px 0 0;
    font-size: 13px;
    color: #636E72;
    line-height: 1.6;
  }

  &__contact {
    margin: 16px 0 0;
    font-size: 13px;
    color: #636E72;
  }
}

.about-repo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-repo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background: #F9FAFB;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 125, 69, 0.45);
    background: rgba(255, 125, 69, 0.06);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #2D3436;
  }

  &__desc {
    font-size: 12px;
    color: #636E72;
  }

  &__url {
    margin-top: 2px;
    font-size: 11px;
    color: #B2BEC3;
    word-break: break-all;
  }

  &__arrow {
    flex-shrink: 0;
    font-size: 12px;
    color: #FF7D45;
  }
}

.about-license-points {
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 13px;
  color: #636E72;
  line-height: 1.8;

  strong {
    color: #2D3436;
  }
}

.about-license-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
