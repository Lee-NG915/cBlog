#!/bin/bash

# 批量合并特性分支到所有测试环境
# 用法: ./scripts/merge-to-test-envs.sh <source-branch>

set -e

SOURCE_BRANCH=$1
TEST_BRANCHES=("test-sg" "test-uk" "test-au" "test-us")

if [ -z "$SOURCE_BRANCH" ]; then
  echo "❌ 请提供源分支名称"
  echo "用法: ./scripts/merge-to-test-envs.sh rickgao/CU-86ewhcu4g/JoyboyOnepieceBack-to-com"
  exit 1
fi

echo "🚀 开始合并 $SOURCE_BRANCH 到所有测试环境..."
echo ""

# 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)

# 先 fetch 所有远程分支，确保本地引用是最新的
echo "📥 更新所有远程分支引用..."
git fetch origin

# 确保源分支存在
if ! git rev-parse --verify "origin/$SOURCE_BRANCH" >/dev/null 2>&1; then
  echo "❌ 源分支 $SOURCE_BRANCH 在远程不存在"
  exit 1
fi

echo "✅ 源分支: origin/$SOURCE_BRANCH"
echo "✅ 当前分支: $CURRENT_BRANCH"
echo ""

# 遍历所有测试分支
for TEST_BRANCH in "${TEST_BRANCHES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 处理 $TEST_BRANCH"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # 检查远程分支是否存在
  if ! git rev-parse --verify "origin/$TEST_BRANCH" >/dev/null 2>&1; then
    echo "⚠️  远程分支 $TEST_BRANCH 不存在，跳过"
    continue
  fi
  
  # 切换到测试分支
  echo "🔄 切换到 $TEST_BRANCH..."
  git checkout "$TEST_BRANCH"
  
  # 强制重置到远程最新（丢弃本地所有改动）
  echo "� 强制重置到远程最新代码（丢弃本地改动）..."
  git reset --hard "origin/$TEST_BRANCH"
  
  # 显示当前状态
  echo "📊 当前 $TEST_BRANCH 最新 commit:"
  git log -1 --oneline
  echo ""
  
  # 尝试合并
  echo "🔀 合并 $SOURCE_BRANCH 到 $TEST_BRANCH..."
  if git merge "origin/$SOURCE_BRANCH" --no-edit; then
    echo "✅ $TEST_BRANCH 合并成功"
    
    # 显示合并后的状态
    echo "📊 合并后的 commit:"
    git log -1 --oneline
    echo ""
    
    # 推送到远程
    echo "📤 推送 $TEST_BRANCH 到远程..."
    if git push origin "$TEST_BRANCH"; then
      echo "✅ $TEST_BRANCH 推送成功"
    else
      echo "❌ $TEST_BRANCH 推送失败"
      exit 1
    fi
  else
    echo "❌ $TEST_BRANCH 合并冲突，需要手动解决"
    echo ""
    echo "冲突文件:"
    git status --short
    echo ""
    echo "请运行以下命令解决冲突："
    echo "  git status"
    echo "  # 解决冲突后"
    echo "  git add ."
    echo "  git commit"
    echo "  git push origin $TEST_BRANCH"
    echo "  # 然后重新运行脚本继续剩余分支"
    exit 1
  fi
done

# 回到原来的分支
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 所有测试环境合并完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git checkout "$CURRENT_BRANCH"
