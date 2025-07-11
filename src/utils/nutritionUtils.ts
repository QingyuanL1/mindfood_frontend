/**
 * 从营养素数组中提取指定营养素的值
 * @param nutrients 营养素数组
 * @param names 尝试的营养素名称数组（按优先级排序）
 * @returns 找到的数值，如果没找到则返回0
 */
export const extractNutrientValue = (nutrients: any[], names: string[]): number => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;

  // 按顺序尝试每个可能的名称
  for (const name of names) {
    const nutrient = nutrients.find((n) => n.nutrient_name === name);
    if (nutrient && nutrient.value) {
      return parseFloat(nutrient.value);
    }
  }

  return 0;
};

/**
 * 计算年龄
 * @param dateOfBirth 出生日期字符串（YYYY-MM-DD格式）
 * @returns 年龄
 */
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

/**
 * 计算基础代谢率(BMR)
 * @param weight 体重（公斤）
 * @param height 身高（厘米）
 * @param age 年龄
 * @param gender 性别（'male'或'female'）
 * @returns 基础代谢率（卡路里）
 */
export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: string
): number => {
  if (gender.toLowerCase() === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}; 