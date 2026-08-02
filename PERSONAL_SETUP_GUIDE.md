# 个人主页配置指南

## 必须修改的文件

### 1. 基本配置 - `_config.yml`

找到并修改以下行：

```yaml
# 第5-8行：个人信息
title: Yuyang(Younger) Wu's Homepage # 改为你的网站标题，如 "吴雨阳的个人主页"
first_name: Yuyang # 改为你的名字
middle_name: # 中间名（可选）
last_name: Wu # 改为你的姓氏

# 第21-22行：网站地址
url: https://HeinzVonHank.github.io # 改为 https://HeinzVonHank.github.io
baseurl:"" # 改为空字符串 ""

# 第267-268行：学者信息
last_name: [Yuyang] # 改为 [你的姓氏]
first_name: [Wu] # 改为 [你的名字, 名字缩写.]
```

### 2. 关于页面 - `_pages/about.md`

替换第30-34行的内容：

```markdown
---
layout: about
title: about
permalink: /
subtitle: <a href='#'>Carnegie Mellon University</a>. 5000 Forbes Ave, Pittsburgh, PA 15213

profile:
  align: right
  image: prof_pic.jpg
  image_circular: false
  more_info: >
    <p>5000 Forbes Ave</p>
    <p> </p>
    <p>Pittsburgh, PA 15213</p>
---

在这里写你的个人简介。介绍你自己、你的研究领域、学术背景等。

你可以添加链接到你感兴趣的内容。下面放置你的照片，代码已经准备好了，只需要将你的照片命名为 `prof_pic.jpg` 并放在 `assets/img/` 文件夹中。

在照片下方放置你的地址/邮箱等联系信息。你也可以通过编辑 `_pages/about.md` 文件的 YAML 头部的 `profile` 属性来禁用这些元素。

编辑 `_bibliography/papers.bib` 文件，Jekyll 会自动渲染你的发表论文页面。

添加你的社交媒体链接。这个主题设置为使用 Font Awesome 图标和 Academicons。
```

### 3. 个人照片 - `assets/img/prof_pic.jpg`

- 替换现有的 `prof_pic.jpg` 为你的个人照片
- 建议尺寸：正方形，至少 400x400 像素
- 格式：JPG 或 PNG

### 4. 社交媒体配置 - `_data/socials.yml`

检查并修改你的社交媒体账号：

```yaml
# 常见的社交媒体配置示例
email: your-email@example.com
twitter: your_twitter_handle
linkedin: your-linkedin-username
github: your-github-username
orcid: your-orcid-id
google_scholar: your-google-scholar-id
```

### 5. 简历数据 - `_data/cv.yml`

编辑你的简历信息，包括：

- 教育背景
- 工作经历
- 技能
- 奖项
- 语言能力

### 6. 论文列表 - `_bibliography/papers.bib`

添加你的发表论文的 BibTeX 条目。

## 可选修改的文件

### 新闻/公告 - `_news/`

在 `_news/` 文件夹中添加 `.md` 文件来发布新闻或公告。

### 项目展示 - `_projects/`

在 `_projects/` 文件夹中修改或添加你的项目展示。

### 博客文章 - `_posts/`

在 `_posts/` 文件夹中添加你的博客文章。

## 部署步骤

1. 确保仓库名为 `HeinzVonHank.github.io`
2. 推送所有更改到 GitHub
3. 在 GitHub 仓库设置中启用 GitHub Pages
4. 选择 `main` 分支作为源
5. 网站将在 `https://HeinzVonHank.github.io` 上线

## 测试本地运行

```bash
# 安装依赖
bundle install

# 本地运行
bundle exec jekyll serve

# 在浏览器中访问 http://localhost:4000
```

## 注意事项

- 修改 `_config.yml` 后需要重启本地服务器
- 图片文件放在 `assets/img/` 文件夹中
- 确保所有文件使用 UTF-8 编码
- 提交前检查 YAML 语法是否正确

## 需要帮助？

如果遇到问题，可以：

1. 查看 [al-folio 文档](https://github.com/alshedivat/al-folio)
2. 检查 GitHub Actions 构建日志
3. 参考 Jekyll 官方文档
