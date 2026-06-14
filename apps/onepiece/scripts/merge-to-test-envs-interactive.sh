#!/bin/bash

# 交互式批量合并到测试环境
# 用法: ./scripts/merge-to-test-envs-interactive.sh <source-branch>

set -e

SOURCE_BRANCH=$1
TEST_BRANCHES=("test-sg" "test-uk" "test-au" "test-us")

if [ -z "$SOURCE_BRANCH" ]; then
  echo "❌ 请提供源分支名称"
  echo "用法: ./scripts/merge-to-test-envs-interactive.sh rickgao/CU-86ewhcu4g/JoyboyOnepieceBack-to-com"
  exit 1
fi

echo "🚀 准备合并 $SOURCE_BRANCH 到测试环境"
echo ""
echo "将合并到以下分支："
for branch in "${TEST_BRANCHES[@]}"; do
  echo "  - $branch"
done
echo ""
read -p "继续? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

CURRENT_BRANCH=$(git branch --show-current)

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

MERGED_BRANCHES=()
FAILED_BRANCHES=()

for TEST_BRANCH in "${TEST_BRANCHES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 $TEST_BRANCH"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  read -p "合并到 $TEST_BRANCH? (y/n/q) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Qq]$ ]]; then
    echo "已退出"
    break
  fi
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏭️  跳过 $TEST_BRANCH"
    continue
  fi
  
  # 检查远程分支是否存在
  if ! git rev-parse --verify "origin/$TEST_BRANCH" >/dev/null 2>&1; then
    echo "⚠️  远程分支 $TEST_BRANCH 不存在，跳过"
    continue
  fi
  
  echo "🔄 切换到 $TEST_BRANCH..."
  git checkout "$TEST_BRANCH"
  
  echo "🔨 强制重置到远程最新代码（丢弃本地改动）..."
  git reset --hard "origin/$TEST_BRANCH"
  
  echo "📊 当前最新 commit:"
  git log -1 --oneline
  echo ""
  
  echo "🔀 合并 $SOURCE_BRANCH..."
  if git merge "origin/$SOURCE_BRANCH" --no-edit && git push origin "$TEST_BRANCH"; then
    echo "✅ $TEST_BRANCH 完成"
    MERGED_BRANCHES+=("$TEST_BRANCH")
  else
    echo "❌ $TEST_BRANCH 失败"
    FAILED_BRANCHES+=("$TEST_BRANCH")
  fi
done

git checkout "$CURRENT_BRANCH"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 合并总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 成功: ${#MERGED_BRANCHES[@]} 个分支"
for branch in "${MERGED_BRANCHES[@]}"; do
  echo "  - $branch"
done

if [ ${#FAILED_BRANCHES[@]} -gt 0 ]; then
  echo ""
  echo "❌ 失败: ${#FAILED_BRANCHES[@]} 个分支"
  for branch in "${FAILED_BRANCHES[@]}"; do
    echo "  - $branch"
  done
fi
